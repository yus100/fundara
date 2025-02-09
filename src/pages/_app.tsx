// pages/_app.tsx
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import { useMemo } from "react";
import dynamic from 'next/dynamic';
import "../styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

// Create client-side only wallet context wrapper
const WalletContextProvider = dynamic(
  () => import('../components/WalletContextProvider'),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <WalletContextProvider>
        <SignedOut>{/* <SignInButton /> */}</SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <Component {...pageProps} />
      </WalletContextProvider>
    </ClerkProvider>
  );
}

export default MyApp;
