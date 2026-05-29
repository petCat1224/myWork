import React, { useEffect, useState, useRef, useTransition } from 'react'
import './index.scss'

const testWords = `5.	核心职责与技术亮点
a)	实现 AI 流式输出（打字机效果）： 摒弃传统的长轮询或一次性返回模式，采用 Fetch API + ReadableStream 对接大模型 SSE（Server-Sent Events）接口。通过手动控制数据流的读取与解码（TextDecoder），实现了毫秒级的实时文本渲染，显著提升了用户在等待 AI 生成时的体验。
b)	Markdown 实时解析与渲染优化： 针对流式返回的 Markdown 文本，结合 markdown-it 实现边生成边解析。解决了流式渲染过程中因标签未闭合导致的页面抖动问题，并实现了代码块的实时语法高亮。`

const App = () => {
  const [words, setWords] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isTyping, setIsTyping] = useState(false)

  const fullTextRef = useRef(testWords)
  const currentIndexRef = useRef(0)
  const lastTimeRef = useRef(0)
  const rafIdRef = useRef(null)
  const typingTimerRef = useRef(null)

  const deferringForInput = isPending && isTyping

  useEffect(() => {
    const typeSpeed = 50

    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
 
      const deltaTime = timestamp - lastTimeRef.current

      if (deltaTime >= typeSpeed) {
        if (currentIndexRef.current < fullTextRef.current.length) {
          const charsToAdd = 1
          const nextIndex = currentIndexRef.current + charsToAdd

          startTransition(() => {
            setWords(fullTextRef.current.substring(0, nextIndex))
          })

          currentIndexRef.current = nextIndex
          lastTimeRef.current = timestamp // 重置上一帧时间
        } else { // 文字全部打印完毕，取消动画帧
          cancelAnimationFrame(rafIdRef.current)
          return
        }
      }

      rafIdRef.current = requestAnimationFrame(animate)
    }

    rafIdRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafIdRef.current)
      clearTimeout(typingTimerRef.current)
    }
  }, [])

  const markTyping = () => {
    setIsTyping(true)
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => setIsTyping(false), 400)
  }

  const handleChange = (e) => {
    setInputValue(e.target.value)
    markTyping()
  }

  return (
    <div style={{ padding: '20px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
      <div className={`output${deferringForInput ? ' output--pending' : ''}`}>{words}</div>

      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={markTyping}
        />
        {deferringForInput && (
          <span className="pending-hint">打字机更新已延后，优先响应输入</span>
        )}
      </div>
    </div>
  )
}

export default App
