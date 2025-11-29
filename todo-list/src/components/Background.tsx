'use client'

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-orange-50 to-orange-100 relative overflow-hidden">
      {/* 云朵装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 左上云朵 */}
        <div className="absolute -top-10 -left-20 w-80 h-40 bg-gradient-to-r from-orange-200/60 to-orange-100/40 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-10 w-60 h-32 bg-gradient-to-r from-orange-300/50 to-orange-200/30 rounded-full blur-2xl" />
        
        {/* 右上云朵 */}
        <div className="absolute -top-10 -right-20 w-80 h-40 bg-gradient-to-l from-orange-200/60 to-orange-100/40 rounded-full blur-3xl" />
        <div className="absolute top-32 -right-10 w-60 h-32 bg-gradient-to-l from-orange-300/50 to-orange-200/30 rounded-full blur-2xl" />
        
        {/* 左下云朵 */}
        <div className="absolute -bottom-10 -left-20 w-96 h-48 bg-gradient-to-r from-orange-300/60 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-36 bg-gradient-to-r from-orange-400/40 to-orange-300/30 rounded-full blur-2xl" />
        
        {/* 右下云朵 */}
        <div className="absolute -bottom-10 -right-20 w-96 h-48 bg-gradient-to-l from-orange-300/60 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-10 w-72 h-36 bg-gradient-to-l from-orange-400/40 to-orange-300/30 rounded-full blur-2xl" />
        
        {/* 中间装饰 */}
        <div className="absolute top-1/2 left-1/4 w-40 h-20 bg-orange-200/30 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-32 h-16 bg-orange-200/30 rounded-full blur-2xl" />
      </div>
      
      {/* 邮件图标装饰 - 左侧 */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="w-20 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-lg shadow-lg transform -rotate-12 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-8 border-2 border-white/80 rounded" />
          </div>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-4 border-l-transparent border-r-transparent border-t-white/80" />
        </div>
      </div>
      
      {children}
    </div>
  )
}
