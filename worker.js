// 导入你需要的函数和数据
importScripts('library/database.js','library/subDatabase.js','similarity.js','puzzle.js');
// 示例：根据操作获取相关的卡片数据

onmessage = function (e) {
  const { startCard, endCard } = e.data;
  findShortestPath(startCard, endCard)
    .then((path) => {
      postMessage({ path });
    })
    .catch((error) => {
      postMessage({ error: "未找到路径" });
    });
};
