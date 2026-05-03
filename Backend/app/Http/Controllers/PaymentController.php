<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class PaymentController extends Controller
{
    public function initiatePayment(Request $request)
    {
        $validated = $request->validate([
            'contest_id' => 'required|exists:contests,id',
            'payment_method' => 'required|in:om,mtn_money,card',
        ]);

        $candidateId = auth('api')->id();
        $contest = \App\Models\Contest::find($validated['contest_id']);

        if (!$contest) {
            return response()->json(['message' => 'Contest not found'], 404);
        }

        // Vérifier que le paiement n'a pas déjà été effectué
        $existingPayment = Payment::where('candidate_id', $candidateId)
            ->where('contest_id', $validated['contest_id'])
            ->where('status', 'completed')
            ->first();

        if ($existingPayment) {
            return response()->json(['message' => 'Payment already completed for this contest'], 400);
        }

        // Get candidate's enrollment to retrieve candidate code
        $enrollment = \App\Models\Enrollment::where('candidate_id', $candidateId)->first();
        $candidateCode = $enrollment ? $enrollment->candidate_code : 'UNKNOWN';
        
        $transactionId = 'SGEE-' . $candidateCode;
        $verificationLink = 'http://localhost:5173/payment-verification?transaction_id=' . $transactionId;

        $payment = Payment::create([
            'candidate_id' => $candidateId,
            'contest_id' => $validated['contest_id'],
            'amount' => $contest->registration_fee,
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $transactionId,
            'verification_link' => $verificationLink,
            'status' => 'completed',
        ]);

        // Generate QR code
        $qrCodePath = $this->generateQrCode($verificationLink, $transactionId);
        $payment->update(['qr_code_path' => $qrCodePath]);

        // Auto-register for contest after payment
        $registration = \App\Models\ContestRegistration::firstOrCreate(
            [
                'candidate_id' => $candidateId,
                'contest_id' => $validated['contest_id'],
            ],
            [
                'status' => 'registered',
                'registered_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Payment completed successfully',
            'payment' => $payment,
            'contest' => [
                'id' => $contest->id,
                'title' => $contest->title,
                'registration_fee' => $contest->registration_fee,
            ],
            'qr_code_url' => asset('storage/' . $qrCodePath),
        ]);
    }

    public function verifyPayment($transaction_id)
    {
        $payment = Payment::where('transaction_id', $transaction_id)
            ->with('candidate', 'contest')
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json([
            'payment' => $payment,
            'candidate' => $payment->candidate,
            'contest' => $payment->contest,
        ]);
    }

    public function completePayment(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:payments,transaction_id',
        ]);

        $payment = Payment::where('transaction_id', $validated['transaction_id'])->first();
        $payment->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Payment completed successfully',
            'payment' => $payment,
        ]);
    }

    private function generateQrCode($data, $filename)
    {
        $qrCode = new QrCode($data);
        $writer = new PngWriter();
        $result = $writer->write($qrCode);

        $path = 'qr_codes/' . $filename . '.png';
        $fullPath = storage_path('app/public/' . $path);
        
        if (!is_dir(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        file_put_contents($fullPath, $result->getString());

        return $path;
    }

    public function getPaymentReceipt($transactionId)
    {
        $payment = Payment::where('transaction_id', $transactionId)
            ->with('candidate', 'contest')
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $candidateId = auth('api')->id();
        if ($payment->candidate_id !== $candidateId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'payment' => $payment,
            'qr_code_url' => asset('storage/' . $payment->qr_code_path),
            'receipt_data' => [
                'transaction_id' => $payment->transaction_id,
                'candidate_name' => $payment->candidate->first_name . ' ' . $payment->candidate->last_name,
                'candidate_email' => $payment->candidate->email,
                'contest_title' => $payment->contest->title,
                'amount' => $payment->amount,
                'payment_method' => $this->getPaymentMethodLabel($payment->payment_method),
                'status' => $this->getStatusLabel($payment->status),
                'date' => $payment->created_at->format('d/m/Y H:i'),
            ],
        ]);
    }

    public function checkPaymentStatus($contestId)
    {
        $candidateId = auth('api')->id();

        $payment = Payment::where('candidate_id', $candidateId)
            ->where('contest_id', $contestId)
            ->where('status', 'completed')
            ->first();

        return response()->json([
            'has_paid' => $payment ? true : false,
            'payment' => $payment,
        ]);
    }

    private function getPaymentMethodLabel($method)
    {
        $methods = [
            'card' => 'Carte Bancaire',
            'om' => 'Orange Money',
            'mtn_money' => 'MTN Money',
        ];
        return $methods[$method] ?? $method;
    }

    private function getStatusLabel($status)
    {
        $statuses = [
            'pending' => 'En attente',
            'completed' => 'Complété',
            'failed' => 'Échoué',
            'cancelled' => 'Annulé',
        ];
        return $statuses[$status] ?? $status;
    }

    public function getAllPayments()
    {
        $payments = Payment::with('candidate', 'contest')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'candidate_name' => $payment->candidate->first_name . ' ' . $payment->candidate->last_name,
                    'candidate_email' => $payment->candidate->email,
                    'contest_title' => $payment->contest->title,
                    'amount' => $payment->amount,
                    'payment_method' => $this->getPaymentMethodLabel($payment->payment_method),
                    'status' => $this->getStatusLabel($payment->status),
                    'date' => $payment->created_at->format('d/m/Y H:i'),
                    'created_at' => $payment->created_at,
                ];
            });

        return response()->json([
            'payments' => $payments,
            'total' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
        ]);
    }
}
