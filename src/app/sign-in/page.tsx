import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div>
            <h1>Sign In to Launchpad</h1>
            <SignIn 
                forceRedirectUrl={"/"}
                signUpUrl="/sign-up"
                routing="hash"  
            />
        </div>
    );
}