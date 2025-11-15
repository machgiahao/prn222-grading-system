'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded bg-primary"></div>
            <h1 className="text-3xl font-bold text-foreground">ExamGrade</h1>
          </div>
          <p className="text-muted-foreground">Exam Submission & Grading System</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-lg bg-card border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isSignup
              ? 'Sign up to get started'
              : 'Sign in to your account'}
          </p>

          {isSignup ? <SignupForm /> : <LoginForm />}

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground text-center">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:text-primary/80 font-medium transition"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          © 2025 ExamGrade System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
