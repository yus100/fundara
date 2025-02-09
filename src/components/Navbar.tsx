// components/Navbar.js
import Link from 'next/link';
import { useState } from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="bg-white border-gray-200 rounded-lg">
    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <Link href="/" className="flex items-center space-x-3">
        <img src="/artificial.png" className="h-8" alt="Fundara Logo" />
        <span className="self-center text-2xl font-semibold whitespace-nowrap">Fundara</span>
      </Link>

      <div className="flex items-center gap-4 md:order-2">
        <WalletMultiButton className="phantom-button" />
        
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="navbar-default"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
        <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white">
          <li>
            <Link 
              href="/" 
              className=" py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 flex items-center"
            >
              <img src="/home.svg" className="h-8 inline mr-2" alt="home icon" />
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/new-project" 
              className="flex items-center py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0"
            >
              <img src="/crowdsource.svg" className="h-8 inline mr-2" alt="fund new project icon" />
              Fund New Project
            </Link>
          </li>
          <SignedIn>
            <li>
              <Link 
                href="/my-donations" 
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0"
              >
                My Donations
              </Link>
            </li>
            <li>
              <Link 
                href="/my-projects" 
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0"
              >
                My Projects
              </Link>
            </li>
            <li className="md:ml-4">
              <UserButton afterSignOutUrl="/" />
            </li>
          </SignedIn>
          <SignedOut>
            <li>
              <SignInButton mode="modal">
                <button className="flex items-center w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:text-blue-700 md:p-0">
                  <img src="/SigninPerson.svg" className="h-8 inline mr-2" alt="person icon" />
                  Sign In
                </button>
              </SignInButton>
            </li>
          </SignedOut>
        </ul>
      </div>
    </div>
  </nav>
  );
}
