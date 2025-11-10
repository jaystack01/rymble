import Channel from "../models/Channel.js";

const defaultChannels = [
  { name: "general" },
  { name: "music" },
  { name: "gaming" },
];

export const seedChannels = async () => {
  const count = await Channel.countDocuments();
  if (count === 0) {
    await Channel.insertMany(defaultChannels);
    console.log("✅ Default channels seeded");
  } else {
    console.log("⚡ Channels already exist, skipping seed");
  }
};
