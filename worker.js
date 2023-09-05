// 导入你需要的函数和数据
importScripts('library/database.js','library/subDatabase.js','similarity.js');
// 导入你需要的函数和数据，确保相对路径是正确的
import { findShortestPath } from 'puzzle.js';
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
