import { useMemo, useState } from 'react'
import { regionData } from 'element-china-area-data'
import './ContactForm.scss'

const PHONE_REG = /^1[3-9]\d{9}$/
const EMAIL_REG = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const INITIAL = {
  name: '',
  phone: '',
  email: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  company: '',
}

const ALL_TOUCHED = {
  name: true,
  phone: true,
  email: true,
  province: true,
  city: true,
  district: true,
  detail: true,
  company: true,
}

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = '请输入姓名'
  if (!values.phone.trim()) errors.phone = '请输入手机号'
  else if (!PHONE_REG.test(values.phone)) errors.phone = '手机号格式不正确'
  if (!values.email.trim()) errors.email = '请输入邮箱'
  else if (!EMAIL_REG.test(values.email)) errors.email = '邮箱格式不正确'
  if (!values.province) errors.province = '请选择省份'
  if (!values.city) errors.city = '请选择城市'
  if (!values.district) errors.district = '请选择区县'
  if (!values.detail.trim()) errors.detail = '请输入详细地址'
  if (!values.company.trim()) errors.company = '请输入公司名称'
  return errors
}

function markTouched(prev, keys) {
  const next = { ...prev }
  keys.forEach((k) => {
    next[k] = true
  })
  return next
}

function pickVisibleErrors(allErrors, touchedMap) {
  const visible = {}
  Object.keys(touchedMap).forEach((key) => {
    if (touchedMap[key] && allErrors[key]) visible[key] = allErrors[key]
  })
  return visible
}

export default function ContactForm() {
  const [values, setValues] = useState(INITIAL)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const allErrors = useMemo(() => validate(values), [values])
  const errors = useMemo(
    () => pickVisibleErrors(allErrors, touched),
    [allErrors, touched],
  )

  const provinces = regionData
  const cities = useMemo(
    () => provinces.find((p) => p.value === values.province)?.children ?? [],
    [values.province, provinces],
  )
  const districts = useMemo(
    () => cities.find((c) => c.value === values.city)?.children ?? [],
    [values.city, cities],
  )

  const setField = (key, val) => {
    const next = { ...values, [key]: val }
    if (key === 'province') {
      next.city = ''
      next.district = ''
    }
    if (key === 'city') next.district = ''

    const touchKeys = [key]
    if (key === 'province') touchKeys.push('city', 'district')
    if (key === 'city') touchKeys.push('district')

    setValues(next)
    setTouched((t) => markTouched(t, touchKeys))
    setSubmitted(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(ALL_TOUCHED)
    if (Object.keys(allErrors).length > 0) return

    const provinceName = provinces.find((p) => p.value === values.province)?.label
    const cityName = cities.find((c) => c.value === values.city)?.label
    const districtName = districts.find((d) => d.value === values.district)?.label

    const payload = {
      name: values.name.trim(),
      phone: values.phone,
      email: values.email.trim(),
      company: values.company.trim(),
      address: `${provinceName}${cityName}${districtName}${values.detail.trim()}`,
      region: [values.province, values.city, values.district],
      detail: values.detail.trim(),
    }

    console.log('表单提交:', payload)
    setSubmitted(true)
  }

  const showError = (key) => touched[key] && errors[key]

  return (
    <div className="contact-form-page">
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <h1 className="form-title">联系信息</h1>

        <label className="form-field">
          <span className="label">
            姓名 <em>*</em>
          </span>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="请输入真实姓名"
            className={showError('name') ? 'is-error' : ''}
            aria-invalid={!!showError('name')}
            aria-describedby={showError('name') ? 'name-error' : undefined}
          />
          {showError('name') && (
            <span id="name-error" className="error" role="alert">
              {errors.name}
            </span>
          )}
        </label>

        <label className="form-field">
          <span className="label">
            手机号 <em>*</em>
          </span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={11}
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
            placeholder="11位手机号码"
            className={showError('phone') ? 'is-error' : ''}
            aria-invalid={!!showError('phone')}
            aria-describedby={showError('phone') ? 'phone-error' : undefined}
          />
          {showError('phone') && (
            <span id="phone-error" className="error" role="alert">
              {errors.phone}
            </span>
          )}
        </label>

        <label className="form-field">
          <span className="label">
            邮箱 <em>*</em>
          </span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="name@example.com"
            className={showError('email') ? 'is-error' : ''}
            aria-invalid={!!showError('email')}
            aria-describedby={showError('email') ? 'email-error' : undefined}
          />
          {showError('email') && (
            <span id="email-error" className="error" role="alert">
              {errors.email}
            </span>
          )}
        </label>

        <label className="form-field">
          <span className="label">
            公司名称 <em>*</em>
          </span>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => setField('company', e.target.value)}
            placeholder="请输入公司全称"
            className={showError('company') ? 'is-error' : ''}
            aria-invalid={!!showError('company')}
            aria-describedby={showError('company') ? 'company-error' : undefined}
          />
          {showError('company') && (
            <span id="company-error" className="error" role="alert">
              {errors.company}
            </span>
          )}
        </label>

        <fieldset className="form-field address-group">
          <legend className="label">
            住址 <em>*</em>
          </legend>
          <div className="cascade-row">
            <select
              value={values.province}
              onChange={(e) => setField('province', e.target.value)}
              className={showError('province') ? 'is-error' : ''}
              aria-label="省份"
            >
              <option value="">省份</option>
              {provinces.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={values.city}
              onChange={(e) => setField('city', e.target.value)}
              disabled={!values.province}
              className={showError('city') ? 'is-error' : ''}
              aria-label="城市"
            >
              <option value="">城市</option>
              {cities.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={values.district}
              onChange={(e) => setField('district', e.target.value)}
              disabled={!values.city}
              className={showError('district') ? 'is-error' : ''}
              aria-label="区县"
            >
              <option value="">区县</option>
              {districts.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          {(showError('province') || showError('city') || showError('district')) && (
            <span className="error" role="alert">
              {errors.province || errors.city || errors.district}
            </span>
          )}
          <textarea
            id="detail"
            rows={3}
            value={values.detail}
            onChange={(e) => setField('detail', e.target.value)}
            placeholder="街道、门牌号、楼层等"
            className={showError('detail') ? 'is-error' : ''}
            aria-invalid={!!showError('detail')}
            aria-describedby={showError('detail') ? 'detail-error' : undefined}
          />
          {showError('detail') && (
            <span id="detail-error" className="error" role="alert">
              {errors.detail}
            </span>
          )}
        </fieldset>

        {submitted && (
          <p className="success-msg" role="status">
            提交成功，信息已校验通过。
          </p>
        )}

        <button type="submit" className="submit-btn">
          提交
        </button>
      </form>
    </div>
  )
}
