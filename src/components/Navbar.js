// components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav
      style={{
        padding: '10px',
        borderBottom: '1px solid #ccc',
        marginBottom: '20px',
      }}
    >
      <Link href="/" style={{ marginRight: '15px' }}>
        Home
      </Link>
      <Link href="/new-project">
        Fund New Project
      </Link>
    </nav>
  );
}
