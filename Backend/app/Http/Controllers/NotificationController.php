<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Récupérer les notifications non lues
     */
    public function getUnreadNotifications()
    {
        $userId = auth('api-users')->id();
        $notifications = NotificationService::getUnreadNotifications($userId);
        $unreadCount = NotificationService::countUnreadNotifications($userId);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Récupérer toutes les notifications
     */
    public function getAllNotifications(Request $request)
    {
        $userId = auth('api-users')->id();
        $limit = $request->query('limit', 20);
        $notifications = NotificationService::getAllNotifications($userId, $limit);
        $unreadCount = NotificationService::countUnreadNotifications($userId);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead($notificationId)
    {
        $notification = NotificationService::markAsRead($notificationId);

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification,
        ]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead()
    {
        $userId = auth('api-users')->id();
        NotificationService::markAllAsRead($userId);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Compter les notifications non lues
     */
    public function countUnreadNotifications()
    {
        $userId = auth('api-users')->id();
        $count = NotificationService::countUnreadNotifications($userId);

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    /**
     * Récupérer les notifications non lues pour les candidats
     */
    public function getCandidateUnreadNotifications()
    {
        $userId = auth('api')->id();
        $notifications = NotificationService::getUnreadNotifications($userId);
        $unreadCount = NotificationService::countUnreadNotifications($userId);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Récupérer toutes les notifications pour les candidats
     */
    public function getCandidateAllNotifications(Request $request)
    {
        $userId = auth('api')->id();
        $limit = $request->query('limit', 20);
        $notifications = NotificationService::getAllNotifications($userId, $limit);
        $unreadCount = NotificationService::countUnreadNotifications($userId);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Compter les notifications non lues pour les candidats
     */
    public function countCandidateUnreadNotifications()
    {
        $userId = auth('api')->id();
        $count = NotificationService::countUnreadNotifications($userId);

        return response()->json([
            'unread_count' => $count,
        ]);
    }
}
