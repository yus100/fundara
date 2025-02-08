// components/Navbar.js
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';

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
      <Link href="/new-project" style={{ marginRight: '15px' }}>
        Fund New Project
      </Link>
      <SignedIn>
        <Link href="/my-donations" style={{ marginRight: '15px' }}>
          My Donations
        </Link>
        <Link href="/my-projects" style={{ marginRight: '15px' }}>
          My Projects
        </Link>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button style={{ padding: '8px 12px' }}>Sign In</button>
        </SignInButton>
      </SignedOut>
    </nav>
  );
}
