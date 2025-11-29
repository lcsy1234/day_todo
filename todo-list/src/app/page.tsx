import Background from '@/components/Background'
import LoginForm from '@/components/LoginForm'

export default function Home() {
  return (
    <Background>
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </Background>
  )
}
