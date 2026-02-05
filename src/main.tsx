import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 获取 HTML 中的 root 元素
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('无法找到 root 元素')
}

// 创建 React 根节点并渲染 App 组件
ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)
