import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudentDashboard } from "./StudentDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";

// Mock the API client
vi.mock("@/lib/api-client", () => ({
  fetchWithAuth: vi.fn(),
}));

// Mock useToast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockStudents = [
  {
    studentId: "1",
    name: "John Doe",
    email: "john@example.com",
    badges: [],
  },
  {
    studentId: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    badges: [],
  },
];

const mockBadges = [
  {
    id: "badge1",
    name: "Python Master",
    description: "Mastered Python",
    imageData: "data:image/png;base64,fake-image",
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("StudentDashboard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <StudentDashboard
          students={mockStudents}
          badges={mockBadges}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it("renders the student list correctly", () => {
    renderComponent();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows no students message when list is empty", async () => {
    // Mock the fetch call that happens on mount when empty
    (fetchWithAuth as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ students: [] }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <StudentDashboard students={[]} badges={mockBadges} />
      </QueryClientProvider>
    );

    // Initial state might show Loading..., so we wait for the fetch to resolve
    await waitFor(() => {
      expect(screen.getByText(/No students found/i)).toBeInTheDocument();
    });
  });

  it("opens add student dialog when clicking add button", () => {
    renderComponent();

    const addButton = screen.getByRole("button", { name: /Add Student/i });
    fireEvent.click(addButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add New Student")).toBeInTheDocument();
  });

  it("allows adding a new student", async () => {
    renderComponent();

    // Open dialog
    fireEvent.click(screen.getByRole("button", { name: /Add Student/i }));

    // Fill form
    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    const nameInput = screen.getByLabelText(/Name/i); // Matches "Name (looking up...)" or just "Name"
    fireEvent.change(nameInput, { target: { value: "New Student" } });

    // Mock successful API response
    (fetchWithAuth as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        student: {
          studentId: "3",
          name: "New Student",
          email: "new@example.com",
        },
      }),
    });

    // Submit
    const submitButton = screen.getByRole("button", { name: "Add Student" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchWithAuth).toHaveBeenCalledWith(
        "students/create",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("new@example.com"),
        })
      );
    });
  });

  it("opens student details when clicking a row", () => {
    renderComponent();

    const row = screen.getByText("John Doe").closest("tr");
    fireEvent.click(row!);

    expect(screen.getByText("Manage Badges for John Doe")).toBeInTheDocument();
  });
});
