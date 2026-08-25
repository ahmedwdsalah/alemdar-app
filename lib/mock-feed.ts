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
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    caption: "Testing the feed with a sample clip 🎬",
    author: "@alemdarteknik",
  },
  {
    id: "feed-2",
    type: "image",
    uri: "https://images.unsplash.com/photo-1631376178637-392efc9e356b?w=900&h=1600&fit=crop&q=80",
    caption: "New Arduino kits just landed",
    author: "@alemdarteknik",
  },
  {
    id: "feed-3",
    type: "video",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    caption: "Behind the scenes at the shop",
    author: "@alemdarteknik",
  },
  {
    id: "feed-4",
    type: "image",
    uri: "https://images.unsplash.com/photo-1765256931845-56da0f7db9cb?w=900&h=1600&fit=crop&q=80",
    caption: "Solar panel restock 🔆",
    author: "@alemdarteknik",
  },
  {
    id: "feed-5",
    type: "video",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    caption: "Quick soldering tip",
    author: "@alemdarteknik",
  },
];