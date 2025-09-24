import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div>
            <h1>Sign In to Launchpad</h1>
            <SignIn 
                redirectUrl="/"
                signUpUrl="/signup"
            />
        </div>
    );
}