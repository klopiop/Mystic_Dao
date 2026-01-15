const fs = require('fs');
const path = require('path');

console.log('🔍 验证 ESA Pages 部署配置...\n');

// 检查静态资源目录
const assetsDir = '.next';
if (fs.existsSync(assetsDir)) {
  console.log('✅ 静态资源目录存在:', assetsDir);
  
  // 检查关键静态文件
  const staticFiles = [
    '.next/static',
    '.next/BUILD_ID',
    '.next/build-manifest.json'
  ];
  
  staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log('  ✅', file);
    } else {
      console.log('  ❌', file, '缺失');
    }
  });
} else {
  console.log('❌ 静态资源目录不存在:', assetsDir);
}

// 检查函数文件
const functionFile = 'functions/dist/index.js';
if (fs.existsSync(functionFile)) {
  console.log('✅ 函数文件存在:', functionFile);
} else {
  console.log('❌ 函数文件不存在:', functionFile);
}

// 检查配置文件
const configFile = 'esa.jsonc';
if (fs.existsSync(configFile)) {
  console.log('✅ 配置文件存在:', configFile);
  
  // 读取并验证配置（移除JSONC注释）
  const configContent = fs.readFileSync(configFile, 'utf8');
  const jsonContent = configContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const config = JSON.parse(jsonContent);
  console.log('  📄 配置内容:');
  console.log('    - 静态资源目录:', config.assets);
  console.log('    - 函数文件路径:', config.function);
} else {
  console.log('❌ 配置文件不存在:', configFile);
}

console.log('\n🎉 部署配置验证完成!');