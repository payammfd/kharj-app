import { Component } from 'react'

// از سفیدشدنِ کاملِ صفحه هنگام خطای پیش‌بینی‌نشده جلوگیری می‌کند
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('UI error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0D0D14',flexDirection:'column',gap:16,padding:24,textAlign:'center',fontFamily:'Vazirmatn,sans-serif',color:'#fff'}}>
          <div style={{fontSize:'2.4rem',opacity:0.5}}>⚠︎</div>
          <div style={{fontWeight:600,fontSize:'1.05rem'}}>یه مشکلی پیش اومد</div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'0.9rem',maxWidth:280,lineHeight:1.7}}>اپ رو دوباره باز کن. اگه باز هم تکرار شد بهمون خبر بده.</div>
          <button onClick={() => window.location.reload()}
            style={{marginTop:8,padding:'12px 28px',borderRadius:20,border:'none',background:'linear-gradient(135deg,#7B6EFF,#4FACFE)',color:'#fff',fontWeight:600,fontFamily:'inherit',fontSize:'0.95rem'}}>
            رفرش
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
