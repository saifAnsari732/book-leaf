// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Page from "../app/page";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { RealtimeTicketProvider } from "../lib/use-ticket-realtime";

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Homepage Plan Selection & Buttons", () => {
  it("renders Choose Plan buttons and handles click", () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <RealtimeTicketProvider>
            <Page />
          </RealtimeTicketProvider>
        </ToastProvider>
      </AuthProvider>
    );

    const choosePlanButtons = screen.getAllByRole("button", { name: /Choose Plan/i });
    expect(choosePlanButtons.length).toBe(3);

    // Click basic plan
    fireEvent.click(choosePlanButtons[0]);

    // Check if RazorpayModal appears
    const checkoutDialog = screen.getByRole("dialog");
    expect(checkoutDialog).toBeInTheDocument();
    expect(screen.getByText("Publishing Payment Checkout")).toBeInTheDocument();
    expect(screen.getByText("Basic Publishing Plan")).toBeInTheDocument();
  });
});
