'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-2xl text-white">Something went wrong</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                We encountered an unexpected error. Don&apos;t worry, your data is safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 overflow-auto">
                  <p className="font-bold mb-1">{this.state.error.name}</p>
                  <p>{this.state.error.message}</p>
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Try again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800"
                >
                  Go to home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
