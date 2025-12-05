import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const Login = () => {
  const navigate = useNavigate();
  const { doSignInWithEmailAndPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;

    setIsSigningIn(true);
    setErrorMessage("");

    try {
      await doSignInWithEmailAndPassword(email, password);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <section className="section text-white h-screen w-full flex items-center py-10">
      <div className="container mx-auto">
        <div className="flex items-center justify-center md:justify-between w-full">
          {/* LEFT SIDE IMAGE */}
          <div className="bg-Image w-[50%] md:h-screen hidden md:block "></div>

          {/* RIGHT SIDE */}
          <div className="w-[80%] md:w-[50%] flex items-center justify-center ">
            <div className="w-[450px] flex flex-col gap-5 md:gap-12">
              {/* HEADER */}
              <div>
                <h1 className="text-[32px] md:text-[40px] leading-tight">
                  Have an account? <br />
                  <span className="textGradient">Log in</span>
                </h1>
              </div>

              {/* FORM */}
              <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-7">
                  {/* EMAIL */}
                  <input
                    className="py-2 text-[16px] font-bold w-full bg-transparent border-0 
                      border-b-2 border-white/50 text-white placeholder:text-white outline-none 
                      placeholder:font-light focus:border-b-white transition-colors"
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {/* PASSWORD */}
                  <input
                    className="py-2 text-[16px] font-bold w-full bg-transparent border-0 
                      border-b-2 border-white/50 text-white placeholder:text-white outline-none 
                      placeholder:font-light focus:border-b-white transition-colors"
                    placeholder="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {/* ERROR MESSAGE */}
                  {errorMessage && (
                    <span className="text-red-600 font-bold text-sm">
                      {errorMessage}
                    </span>
                  )}

                  {/* SIGN IN BUTTON */}
                  <button
                    disabled={isSigningIn}
                    className={`w-full p-3 rounded-full cursor-pointer text-[16px] ${
                      isSigningIn
                        ? "bg-gray-300 cursor-not-allowed"
                        : "btnGradient"
                    }`}
                    type="submit"
                  >
                    {isSigningIn ? "Signing In..." : "Sign In"}
                  </button>

                  {/* SIGN UP LINK */}
                  <div className="text-center">
                    Don't have an account?{" "}
                    <span className="font-bold underline">
                      <Link to={"/register"}>Sign Up</Link>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
