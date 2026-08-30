export type FeedMediaType = "image" | "video";

export interface FeedItem {
  id: string;
  type: FeedMediaType;
  uri: string;
  caption: string;
  author: string;
}

export const FEED_ITEMS: FeedItem[] = [
  {
    id: "feed-1",
    type: "video",
    uri: "https://res.cloudinary.com/tsadltdd/video/upload/v1788123165/WhatsApp_Video_2026-08-28_at_12.11.46.mp4",
    caption: "Testing the feed with a sample clip 🎬",
    author: "@alemdarteknik",
  },

  {
    id: "feed-2",
    type: "video",
    uri: "https://res.cloudinary.com/tsadltdd/video/upload/v1788123206/WhatsApp_Video_2026-08-28_at_12.11.39.mp4",
    caption: "Behind the scenes at the shop",
    author: "@alemdarteknik",
  },
  {
    id: "feed-3",
    type: "video",
    uri: "https://res.cloudinary.com/tsadltdd/video/upload/q_auto,f_auto,w_1080,c_limit/v1787911361/1.mp4",
    caption: "Solar panel restock 🔆",
    author: "@alemdarteknik",
  },
 
 {
    id: "feed-4",
    type: "video",
    uri: "https://res.cloudinary.com/tsadltdd/video/upload/q_auto,f_auto,w_1080,c_limit/v1787911425/2.mp4",
    caption: "Engineering the future, one build at a time",
    author: "@alemdarteknik",
  },

  {
    id: "feed-5",
    type: "video",
    uri: "https://res.cloudinary.com/tsadltdd/video/upload/q_auto,f_auto,w_1080,c_limit/v1787909493/WhatsApp_Video_2026-08-28_at_12.11.31.mp4",
    caption: "Engineering the future, one build at a time",
    author: "@alemdarteknik",
  },
];