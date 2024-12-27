export default {
  test: {
    include: ["**/test/*.*"],
    watch: false,
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },
};
