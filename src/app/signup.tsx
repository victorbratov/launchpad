import { SignUp} from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <SignUp
            signUpFields={[
                {
                    type: "email_address", required: true, placeholder: "Email Address"
                },
                {
                    type: "password", required: true, placeholder: "Password",
                    label: "Sign up as",
                    options: [
                        { label: "Investor", value: "investor" },
                        { label: "Business Owner", value: "business_owner" },
                    ]
                }
            ]}
            />
    );
}