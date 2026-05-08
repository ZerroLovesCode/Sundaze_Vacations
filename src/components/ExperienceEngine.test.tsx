import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExperienceEngine from "@/components/ExperienceEngine";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const defaultProps = {
  budget: 2500,
  onBudgetChange: vi.fn(),
  destination: "Tokyo",
  vibe: "Foodie",
  days: 3,
  onDaysChange: vi.fn(),
  itinerary: [],
  onUpdateItinerary: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ExperienceEngine", () => {
  it("renders the component with correct heading", () => {
    render(<ExperienceEngine {...defaultProps} />);
    expect(screen.getByText("Experience Engine")).toBeInTheDocument();
  });

  it("shows the budget slider with current value", () => {
    render(<ExperienceEngine {...defaultProps} />);
    expect(screen.getByText("$2,500")).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
  });

  it("disables the submit button when prompt is empty", () => {
    render(<ExperienceEngine {...defaultProps} />);
    const button = screen.getByRole("button", { name: /Update Itinerary/i });
    expect(button).toBeDisabled();
  });

  it("enables submit button when prompt has content", async () => {
    const user = userEvent.setup();
    render(<ExperienceEngine {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Make Day 2 more relaxing/i);
    await user.type(textarea, "Add a street food tour");
    const button = screen.getByRole("button", { name: /Update Itinerary/i });
    expect(button).not.toBeDisabled();
  });

  it("calls the API and updates itinerary on submit", async () => {
    const user = userEvent.setup();
    const mockItinerary = [{ day: "Day 1", date: "Oct 1", activities: [] }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ itinerary: mockItinerary }),
    });

    render(<ExperienceEngine {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Make Day 2 more relaxing/i);
    await user.type(textarea, "Add a street food tour");
    fireEvent.submit(screen.getByRole("form", { name: /Refine itinerary form/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/generate",
        expect.objectContaining({ method: "POST" })
      );
      expect(defaultProps.onUpdateItinerary).toHaveBeenCalledWith(mockItinerary);
    });
  });

  it("shows an error message when the API call fails", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Gemini is unavailable" }),
    });

    render(<ExperienceEngine {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Make Day 2 more relaxing/i);
    await user.type(textarea, "Something bold");
    fireEvent.submit(screen.getByRole("form", { name: /Refine itinerary form/i }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Gemini is unavailable");
    });
  });

  it("renders the wheelchair accessibility checkbox", () => {
    render(<ExperienceEngine {...defaultProps} />);
    const checkbox = screen.getByLabelText(/Wheelchair Accessible/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });
});
