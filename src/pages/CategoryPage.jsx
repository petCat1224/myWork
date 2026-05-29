import { useCallback, useEffect, useRef, useState } from 'react'
import './CategoryPage.scss'

const BANNERS = [
  { id: 1, title: '新鲜直达', subtitle: '30分钟送到家', color: '#00b578' },
  { id: 2, title: '限时特惠', subtitle: '满99减20', color: '#ff6b35' },
  { id: 3, title: '品质优选', subtitle: '源头直采更安心', color: '#4a90d9' },
]

const CATEGORIES = [
  { id: 'fruit', name: '新鲜水果', icon: '🍎' },
  { id: 'veg', name: '时令蔬菜', icon: '🥬' },
  { id: 'meat', name: '肉禽蛋品', icon: '🥩' },
  { id: 'seafood', name: '海鲜水产', icon: '🦐' },
  { id: 'dairy', name: '乳品烘焙', icon: '🥛' },
  { id: 'snack', name: '休闲零食', icon: '🍿' },
  { id: 'drink', name: '酒水饮料', icon: '🥤' },
  { id: 'daily', name: '日用百货', icon: '🧴' },
]

const PRODUCTS = {
  fruit: [
    { id: 1, name: '红富士苹果 500g', price: '9.9', tag: '热销' },
    { id: 2, name: '进口香蕉 1kg', price: '6.8', tag: '' },
    { id: 3, name: '阳光玫瑰葡萄 500g', price: '19.9', tag: '新品' },
    { id: 4, name: '智利车厘子 250g', price: '39.9', tag: '限时' },
  ],
  veg: [
    { id: 5, name: '有机小白菜 300g', price: '4.5', tag: '' },
    { id: 6, name: '新鲜番茄 500g', price: '5.9', tag: '热销' },
    { id: 7, name: '西兰花 1颗', price: '7.8', tag: '' },
  ],
  meat: [
    { id: 8, name: '精选猪里脊 300g', price: '18.8', tag: '' },
    { id: 9, name: '散养土鸡蛋 10枚', price: '15.9', tag: '热销' },
    { id: 10, name: '冷鲜鸡胸肉 400g', price: '12.5', tag: '' },
  ],
  seafood: [
    { id: 11, name: '鲜活基围虾 250g', price: '29.9', tag: '限时' },
    { id: 12, name: '三文鱼刺身 100g', price: '35.0', tag: '' },
  ],
  dairy: [
    { id: 13, name: '纯牛奶 1L', price: '12.9', tag: '' },
    { id: 14, name: '全麦吐司 400g', price: '9.9', tag: '热销' },
  ],
  snack: [
    { id: 15, name: '混合坚果 200g', price: '22.8', tag: '' },
    { id: 16, name: '海苔脆片 80g', price: '8.5', tag: '' },
  ],
  drink: [
    { id: 17, name: '天然矿泉水 550ml×6', price: '9.9', tag: '' },
    { id: 18, name: '100%橙汁 1L', price: '14.5', tag: '新品' },
  ],
  daily: [
    { id: 19, name: '抽纸 3层130抽×6包', price: '19.9', tag: '热销' },
    { id: 20, name: '洗衣液 2kg', price: '25.8', tag: '' },
  ],
}

const TAB_ITEMS = [
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'category', label: '分类', icon: '📋' },
  { id: 'cart', label: '购物车', icon: '🛒' },
  { id: 'mine', label: '我的', icon: '👤' },
]

function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BANNERS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="banner-carousel">
      <div
        className="banner-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {BANNERS.map((banner) => (
          <div
            key={banner.id}
            className="banner-slide"
            style={{ background: banner.color }}
          >
            <div className="banner-text">
              <h3>{banner.title}</h3>
              <p>{banner.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="banner-dots">
        {BANNERS.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            className={`dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`第${index + 1}张轮播图`}
          />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-img">
        <span className="product-emoji">🛍️</span>
        {product.tag && <span className="product-tag">{product.tag}</span>}
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <div className="product-bottom">
          <span className="product-price">
            <small>¥</small>
            {product.price}
          </span>
          <button type="button" className="add-btn" aria-label="加入购物车">
            +
          </button>
        </div>
      </div>
    </div>
  )
}

function getSectionTop(container, section) {
  return section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
}

export default function CategoryPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const [activeTab, setActiveTab] = useState('category')

  const productListRef = useRef(null)
  const sidebarRef = useRef(null)
  const sectionRefs = useRef({})
  const isProgrammaticScroll = useRef(false)
  const scrollEndTimer = useRef(null)
  const lastScrollTop = useRef(0)

  const syncActiveCategoryFromScroll = useCallback(() => {
    const container = productListRef.current
    if (!container || isProgrammaticScroll.current) return

    const anchor = container.scrollTop + 12
    let matched = CATEGORIES[0].id

    for (const cat of CATEGORIES) {
      const section = sectionRefs.current[cat.id]
      if (section && getSectionTop(container, section) <= anchor) {
        matched = cat.id
      }
    }

    setActiveCategory((prev) => (prev !== matched ? matched : prev))
    lastScrollTop.current = container.scrollTop
  }, [])

  const handleProductScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return
    clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(syncActiveCategoryFromScroll, 16)
  }, [syncActiveCategoryFromScroll])

  const scrollToCategory = useCallback((catId) => {
    const container = productListRef.current
    const section = sectionRefs.current[catId]
    if (!container || !section) return

    isProgrammaticScroll.current = true
    setActiveCategory(catId)

    container.scrollTo({
      top: getSectionTop(container, section),
      behavior: 'smooth',
    })

    clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false
      lastScrollTop.current = container.scrollTop
    }, 400)
  }, [])

  useEffect(() => {
    const sidebar = sidebarRef.current
    const activeItem = sidebar?.querySelector('.category-item.active')
    activeItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeCategory])

  useEffect(() => {
    return () => clearTimeout(scrollEndTimer.current)
  }, [])

  return (
    <div className="category-page">
      <header className="page-header">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="search" placeholder="搜索商品" readOnly />
        </div>
      </header>

      <BannerCarousel />

      <div className="category-body">
        <aside className="category-sidebar" ref={sidebarRef}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => scrollToCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </aside>

        <main
          className="product-list"
          ref={productListRef}
          onScroll={handleProductScroll}
        >
          {CATEGORIES.map((cat) => (
            <section
              key={cat.id}
              className="category-section"
              ref={(el) => {
                sectionRefs.current[cat.id] = el
              }}
              data-category-id={cat.id}
            >
              <h2 className="section-title">{cat.name}</h2>
              <div className="product-grid">
                {(PRODUCTS[cat.id] || []).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <nav className="bottom-tabbar">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
