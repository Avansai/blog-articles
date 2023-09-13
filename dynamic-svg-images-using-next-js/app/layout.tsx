import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body
        style={{
          position: 'absolute',
          padding: 0,
          margin: 0,
          height: '100%',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100%',
            height: 'auto',
          }}
        >
          <div style={{ margin: '10%' }}>{children}</div>
        </div>
      </body>
    </html>
  )
}
