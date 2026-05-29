import { useEffect, useState } from 'react'
import './ProductIntroPage.scss'

const NAV_ITEMS = [
  { id: 'company', label: '公司信息' },
  { id: 'products', label: '产品介绍' },
  { id: 'about', label: '关于我们' },
]

const PRODUCT_LIST = [
  {
    title: '智能供应链平台',
    desc: '覆盖采购、仓储、配送全链路，帮助企业降本增效，数据可视化驱动经营决策。',
    tags: ['SaaS', '数据中台'],
  },
  {
    title: '移动端运营套件',
    desc: '一站式活动配置、会员运营与消息触达，支持多端自适应，快速上线营销活动。',
    tags: ['跨端', '低代码'],
  },
  {
    title: '企业安全合规方案',
    desc: '权限分级、操作审计与风险预警一体化，满足多行业合规要求，保障业务稳定运行。',
    tags: ['安全', '审计'],
  },
]

const MILESTONES = [
  { year: '2018', text: '公司成立，专注企业数字化服务' },
  { year: '2020', text: '服务客户突破 500 家，产品矩阵初步成型' },
  { year: '2023', text: '完成 A 轮融资，研发团队扩展至 200+ 人' },
  { year: '2026', text: '推出 AI 辅助决策模块，持续深耕行业场景' },
]

const VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const VIDEO_POSTER =
  'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217'

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function FloatAssistant() {
  return (
    <div className="float-assistant" aria-label="关于我们，悬停查看联系二维码">
      <div className="float-panel">
        <p className="panel-title">扫码联系我们</p>
        <img src="/contact-qr.svg" alt="联系人二维码" width={140} height={140} />
        <p className="panel-hint">微信 / 企业微信</p>
      </div>
      <button
        type="button"
        className="robot-btn"
        onClick={() => scrollToSection('about')}
      >
        <span className="robot-icon" aria-hidden>
          🤖
        </span>
        <span className="robot-label">关于我们</span>
      </button>
    </div>
  )
}

export default function ProductIntroPage() {
  const [activeNav, setActiveNav] = useState('company')
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActiveNav(visible.target.id)
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0.1, 0.35, 0.6] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const handleNavClick = (id) => {
    scrollToSection(id)
    setMenuOpen(false)
  }

  return (
    <div className="product-intro-page">
      <header className="site-header">
        <div className="header-inner">
          <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span className="brand-icon">◆</span>
            <span className="brand-name">智云科技</span>
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-label="打开导航菜单"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeNav === item.id ? 'is-active' : ''}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-content">
            <p className="hero-tag">数字化 · 智能化 · 可信赖</p>
            <h1>让产品价值被看见</h1>
            <p className="hero-desc">
              智云科技致力于为企业提供可落地的数字化解决方案，以技术驱动业务增长。
            </p>
          </div>
          <div className="video-wrap">
            <video
              className="intro-video"
              controls
              playsInline
              preload="metadata"
              poster={VIDEO_POSTER}
            >
              <source src={VIDEO_SRC} type="video/mp4" />
              您的浏览器暂不支持视频播放。
            </video>
          </div>
        </section>

        <section id="company" className="section company-section">
          <div className="section-inner">
            <h2 className="section-title">公司信息</h2>
            <p className="section-subtitle">以长期主义服务客户，用专业赢得信任</p>
            <div className="info-grid">
              <article className="info-card">
                <h3>公司简介</h3>
                <p>
                  智云科技成立于 2018 年，总部位于上海，在北京、深圳设有研发中心。我们聚焦零售、制造、金融等行业，
                  为客户提供从咨询规划到系统交付的全流程服务。
                </p>
              </article>
              <article className="info-card">
                <h3>核心数据</h3>
                <ul>
                  <li><strong>800+</strong> 企业客户</li>
                  <li><strong>99.95%</strong> 系统可用性</li>
                  <li><strong>7×24</strong> 技术支持</li>
                  <li><strong>50+</strong> 行业解决方案</li>
                </ul>
              </article>
              <article className="info-card">
                <h3>联系方式</h3>
                <ul className="contact-list">
                  <li>电话：400-888-6600</li>
                  <li>邮箱：contact@zhiyun-tech.com</li>
                  <li>地址：上海市浦东新区张江高科技园区</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="products" className="section products-section">
          <div className="section-inner">
            <h2 className="section-title">产品介绍</h2>
            <p className="section-subtitle">模块化能力组合，按需扩展，快速落地</p>
            <div className="product-list">
              {PRODUCT_LIST.map((item, index) => (
                <article key={item.title} className="product-card">
                  <span className="product-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="product-body">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <div className="product-tags">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="section-inner">
            <h2 className="section-title">关于我们</h2>
            <p className="section-subtitle">使命、愿景与团队文化</p>
            <div className="about-layout">
              <div className="about-mission">
                <h3>我们的使命</h3>
                <p>
                  用可信赖的技术产品，帮助每一家企业更高效地连接客户、优化运营、实现可持续增长。
                </p>
                <h3>我们的愿景</h3>
                <p>成为亚太地区领先的企业数字化基础设施服务商。</p>
              </div>
              <ol className="timeline">
                {MILESTONES.map((item) => (
                  <li key={item.year}>
                    <span className="year">{item.year}</span>
                    <span className="text">{item.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 智云科技有限公司 · 沪ICP备00000000号</p>
      </footer>

      <FloatAssistant />
    </div>
  )
}
