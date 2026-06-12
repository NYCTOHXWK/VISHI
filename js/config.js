// 19 Years, 19 Chapters configuration
// Single control center: customize the website by editing this file only.
window.STORY_CONFIG = {
  // CHANGE HER NAME HERE
  girlName: "SWEETU",
  // CHANGE BIRTHDAY DATE HERE
  birthdayDate: "2026-06-18T00:00:00+05:30",
  timezone: "Asia/Kolkata",
  users: [
    {
      // ADMIN - Full control over all test subjects
      username: "admin",
      password: "Vinay",
      role: "admin",
      canManage: ["birthdaygirl", "testsubject1", "testsubject2", "testsubject3"]
    },
    {
      // MAIN BIRTHDAY GIRL - Primary recipient
      username: "birthdaygirl",
      password: "change_me",
      role: "birthdayGirl",
      isTestSubject: false
    },
    {
      // TEST SUBJECT 1 - For testing and previewing
      username: "testsubject1",
      password: "test123",
      role: "testsubject",
      isTestSubject: true,
      displayName: "Test Subject 1"
    },
    {
      // TEST SUBJECT 2 - For testing and previewing
      username: "testsubject2",
      password: "test123",
      role: "testsubject",
      isTestSubject: true,
      displayName: "Test Subject 2"
    },
    {
      // TEST SUBJECT 3 - For testing and previewing
      username: "testsubject3",
      password: "test123",
      role: "testsubject",
      isTestSubject: true,
      displayName: "Test Subject 3"
    },
    {
      // LEGACY TESTER - General QA testing (backward compatible)
      username: "tester",
      password: "tester123",
      role: "tester",
      isTestSubject: true,
      displayName: "QA Tester"
    }
  ],
  media: {
    videoPath: "assets/videos/surprise.mp4",
    musicPath: "assets/audio/background.mp3",
    birthdaySongPath: "assets/audio/birthday-song.mp3"
  },
  unlockSettings: {
    totalChapters: 19,
    preFinalChapter: 18,
    preFinalUnlock: "2026-06-17T23:45:00+05:30",
    finalUnlock: "2026-06-18T00:00:00+05:30",
    storageKey: "vishi_unlock_schedule_v2",
    sessionKey: "vishi_session_v2"
  },
  session: {
    timeoutMinutes: 45,
    rememberDays: 7
  },
  privateMode: {
    enabled: true,
    disableRightClick: true,
    disableImageDragging: true,
    disableTextSelection: true,
    blurOnTabHidden: true,
    watermark: true,
    watermarkText: "For {girlName} only"
  },
  theme: {
    name: "Luxury Romantic Storybook",
    colors: {
      blush: "#f7c8d6",
      roseGold: "#b76e79",
      champagneGold: "#d8a85b",
      creamWhite: "#fffaf2",
      warmBeige: "#e8d7c0"
    },
    initials: "V ❤️ S",
    reducedMotionRespect: true
  },
  chapters: [
    {
      number: 1,
      title: "A Beautiful Beginning",
      image: "assets/images/ch1.jpg",
      alt: "Chapter 1 memory photo for A Beautiful Beginning",
      text: "Chapter 1 begins with curiosity, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I do not only think about dates on a calendar. I think about the first time I felt this way.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 2,
      title: "The First Thing I Noticed",
      image: "assets/images/ch2.jpg",
      alt: "Chapter 2 memory photo for The First Thing I Noticed",
      text: "Chapter 2 begins with interest, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I do not only think about dates. I think about how you made me feel.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 3,
      title: "Getting To Know You",
      image: "assets/images/ch3.jpg",
      alt: "Chapter 3 memory photo for Getting To Know You",
      text: "Chapter 3 begins with warmth, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I do not only think about dates or feelings. I think about understanding you.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 4,
      title: "Comfort",
      image: "assets/images/ch4.jpg",
      alt: "Chapter 4 memory photo for Comfort",
      text: "Chapter 4 begins with comfort, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I do not only think about moments. I think about peace with you.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 5,
      title: "A Memory Worth Keeping",
      image: "assets/images/ch5.jpg",
      alt: "Chapter 5 memory photo for A Memory Worth Keeping",
      text: "Chapter 5 begins with appreciation, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I do not only think about the big moments. I think about every precious memory.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 6,
      title: "Your Smile",
      image: "assets/images/ch6.jpg",
      alt: "Chapter 6 memory photo for Your Smile",
      text: "Chapter 6 begins with admiration, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about your smile and how it changes everything.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 7,
      title: "The Little Things",
      image: "assets/images/ch7.jpg",
      alt: "Chapter 7 memory photo for The Little Things",
      text: "Chapter 7 begins with attention, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about the small moments that became the biggest.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 8,
      title: "More Than Beautiful",
      image: "assets/images/ch8.jpg",
      alt: "Chapter 8 memory photo for More Than Beautiful",
      text: "Chapter 8 begins with respect, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about your strength and spirit.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 9,
      title: "You Changed Things",
      image: "assets/images/ch9.jpg",
      alt: "Chapter 9 memory photo for You Changed Things",
      text: "Chapter 9 begins with attachment, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about how you changed my world.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 10,
      title: "Halfway",
      image: "assets/images/ch10.jpg",
      alt: "Chapter 10 memory photo for Halfway",
      text: "Chapter 10 begins with reflection, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about where we are and how far we've come.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 11,
      title: "My Favorite Conversations",
      image: "assets/images/ch11.jpg",
      alt: "Chapter 11 memory photo for My Favorite Conversations",
      text: "Chapter 11 begins with closeness, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about our conversations and what they mean.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 12,
      title: "What I Admire",
      image: "assets/images/ch12.jpg",
      alt: "Chapter 12 memory photo for What I Admire",
      text: "Chapter 12 begins with gratitude, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about all the things I admire about you.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 13,
      title: "Future Memories",
      image: "assets/images/ch13.jpg",
      alt: "Chapter 13 memory photo for Future Memories",
      text: "Chapter 13 begins with hope, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about the future and what we'll become.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 14,
      title: "Something Important",
      image: "assets/images/ch14.jpg",
      alt: "Chapter 14 memory photo for Something Important",
      text: "Chapter 14 begins with honesty, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about what matters most.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 15,
      title: "The Truth",
      image: "assets/images/ch15.jpg",
      alt: "Chapter 15 memory photo for The Truth",
      text: "Chapter 15 begins with truth, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about the truth of what you mean to me.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 16,
      title: "One Of A Kind",
      image: "assets/images/ch16.jpg",
      alt: "Chapter 16 memory photo for One Of A Kind",
      text: "Chapter 16 begins with devotion, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about how truly one of a kind you are.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 17,
      title: "If You Ever Doubt Yourself",
      image: "assets/images/ch17.jpg",
      alt: "Chapter 17 memory photo for If You Ever Doubt Yourself",
      text: "Chapter 17 begins with reassurance, the kind of feeling that does not need to arrive loudly to become unforgettable. When I imagine this year of your life, I think about reminding you of your worth.",
      reveal: "A little more of the story opens here."
    },
    {
      number: 18,
      title: "Almost Midnight",
      image: "assets/images/ch18.jpg",
      alt: "Chapter 18 memory photo for Almost Midnight",
      text: "We've reached the final memory. There is only one chapter left. Come back when the clock strikes midnight.\n\nThis chapter is intentionally quiet, because some moments deserve the solemnity of almost-arrival.",
      reveal: "The final door is almost ready."
    },
    {
      number: 19,
      title: "Happy 19th Birthday",
      image: "assets/images/ch19.jpg",
      alt: "Chapter 19 memory photo for Happy 19th Birthday",
      text: "Happy Birthday.\n\nHappy Nineteenth Birthday.\n\nToday is your day. A day to celebrate every smile you've shared. Every challenge you've overcome. Every lesson you've learned. Every moment that made you who you are.",
      reveal: "The final door is almost ready."
    }
  ]
};
