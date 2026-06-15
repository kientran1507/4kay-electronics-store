import CustomerLogin from "../components/customer-sign-in";
import AuthLayout from "../components/auth-layout";

const CustomerSignInPage = () => {
  return (
    <AuthLayout>
      <CustomerLogin />
    </AuthLayout>
  );
};

export default CustomerSignInPage;