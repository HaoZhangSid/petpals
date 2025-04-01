export const mockActivities = [
  {
    id: "activity-1",
    type: "like",
    actor: {
      id: "user-567",
      name: "李小花",
      avatar: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8"
    },
    content: "喜欢了你的宠物",
    pet: {
      id: "pet-1",
      name: "奶糖"
    },
    timestamp: "2023-06-20T10:30:00Z",
    timeAgo: "2小时前",
    read: false,
    actionButtons: [
      {
        label: "查看",
        action: "view",
        style: "text-blue-500"
      }
    ]
  },
  {
    id: "activity-2",
    type: "connection_request",
    actor: {
      id: "user-678",
      name: "张三",
      avatar: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e"
    },
    content: "向您发送了好友请求",
    timestamp: "2023-06-19T15:20:00Z",
    timeAgo: "昨天",
    read: false,
    actionButtons: [
      {
        label: "接受",
        action: "accept",
        style: "bg-pink-500"
      },
      {
        label: "拒绝",
        action: "reject",
        style: "bg-gray-200"
      }
    ]
  },
  {
    id: "activity-3",
    type: "comment",
    actor: {
      id: "user-789",
      name: "王五",
      avatar: "https://images.unsplash.com/photo-1529429617124-95b109e86bb8"
    },
    content: "评论了您的宠物照片",
    timestamp: "2023-06-17T09:45:00Z",
    timeAgo: "3天前",
    read: true,
    actionButtons: [
      {
        label: "回复",
        action: "reply",
        style: "text-blue-500"
      }
    ]
  }
]; 