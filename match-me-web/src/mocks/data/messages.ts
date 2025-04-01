export const mockMessages = [
  {
    id: "conversation-1",
    partnerId: "user-567",
    partnerName: "李小花",
    partnerAvatar: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8",
    lastMessage: "我和奶糖明天可以参加聚会吗？",
    timestamp: "2023-06-20T10:30:00Z",
    timeAgo: "2小时前",
    unread: 2,
    online: true
  },
  {
    id: "conversation-2",
    partnerId: "user-678",
    partnerName: "张三",
    partnerAvatar: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
    lastMessage: "谢谢你的建议，我家的狗狗很喜欢这个玩具",
    timestamp: "2023-06-19T15:20:00Z",
    timeAgo: "昨天",
    unread: 0,
    online: false
  },
  {
    id: "conversation-3",
    partnerId: "user-789",
    partnerName: "王五",
    partnerAvatar: "https://images.unsplash.com/photo-1529429617124-95b109e86bb8",
    lastMessage: "我们可以安排一次宠物约会吗？",
    timestamp: "2023-06-17T09:45:00Z",
    timeAgo: "3天前",
    unread: 0,
    online: true
  }
];

export const mockChatMessages = {
  "conversation-1": [
    {
      id: "msg-1-1",
      senderId: "user-567",
      content: "嗨，你好！你家的猫咪真可爱，叫什么名字？",
      timestamp: "2023-06-20T09:30:00Z",
      timeFormatted: "09:30"
    },
    {
      id: "msg-1-2",
      senderId: "current-user",
      content: "谢谢！她叫奶糖，是一只英短，已经3岁了。",
      timestamp: "2023-06-20T09:35:00Z",
      timeFormatted: "09:35"
    },
    {
      id: "msg-1-3",
      senderId: "user-567",
      content: "我家有一只金毛，叫阳阳，他非常喜欢和猫咪玩。",
      timestamp: "2023-06-20T09:40:00Z",
      timeFormatted: "09:40"
    },
    {
      id: "msg-1-4",
      senderId: "user-567",
      content: "周末我们要在中央公园举办一个宠物聚会，你有兴趣吗？",
      timestamp: "2023-06-20T10:20:00Z",
      timeFormatted: "10:20"
    },
    {
      id: "msg-1-5",
      senderId: "user-567",
      content: "我和奶糖明天可以参加聚会吗？",
      timestamp: "2023-06-20T10:30:00Z",
      timeFormatted: "10:30"
    }
  ],
  "conversation-2": [
    {
      id: "msg-2-1",
      senderId: "current-user",
      content: "你好，我看到你在找宠物玩具的推荐？",
      timestamp: "2023-06-19T14:00:00Z",
      timeFormatted: "14:00"
    },
    {
      id: "msg-2-2",
      senderId: "user-678",
      content: "是的，我家的小狗很喜欢咬东西，需要一些耐咬的玩具。",
      timestamp: "2023-06-19T14:15:00Z",
      timeFormatted: "14:15"
    },
    {
      id: "msg-2-3",
      senderId: "current-user",
      content: "我推荐KONG的玩具，很结实，而且可以放零食进去，让狗狗更有兴趣。",
      timestamp: "2023-06-19T14:30:00Z",
      timeFormatted: "14:30"
    },
    {
      id: "msg-2-4",
      senderId: "user-678",
      content: "谢谢你的建议，我家的狗狗很喜欢这个玩具",
      timestamp: "2023-06-19T15:20:00Z",
      timeFormatted: "15:20"
    }
  ]
}; 