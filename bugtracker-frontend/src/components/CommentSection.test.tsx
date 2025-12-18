import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "./CommentSection";
import { Comment } from "@/types/comment";

describe("CommentSection", () => {
  const mockComments: Comment[] = [
    {
      id: "1",
      bugId: "1",
      author: "John Doe",
      content: "This is a test comment",
      createdAt: "2023-06-10T10:00:00.000Z",
    },
  ];

  beforeAll(() => {
    (global as any).fetch = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to render component with defaults
  const renderComponent = (
    props?: Partial<React.ComponentProps<typeof CommentSection>>
  ) => {
    return render(
      <CommentSection
        bugId={1}
        comments={props?.comments ?? []}
        onCommentAdded={props?.onCommentAdded ?? jest.fn()}
      />
    );
  };

  it("should render the comment section with existing comments", () => {
    renderComponent({ comments: mockComments });
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("This is a test comment")).toBeInTheDocument();
  });

  it("should submit a new comment", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const onCommentAdded = jest.fn();

    renderComponent({ comments: [], onCommentAdded });

    await user.type(screen.getByLabelText(/your name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/comment/i), "This is a new comment");

    const button = screen.getByRole("button", { name: /add comment/i });

    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/bugs/1/comments",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(onCommentAdded).toHaveBeenCalled();
    });
  });

  it("should handle error when submitting a comment", async () => {
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to add comment")
    );

    const user = userEvent.setup();
    renderComponent({ comments: [] });

    await user.type(screen.getByLabelText(/your name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/comment/i), "This is a new comment");

    const button = screen.getByRole("button", { name: /add comment/i });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add comment/i })
      ).toBeInTheDocument();
    });

    consoleErrorMock.mockRestore();
  });

  it("should render empty comments message when no comments are provided", () => {
    renderComponent({ comments: [] });
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("should disable the submit button when form fields are empty", () => {
    renderComponent({ comments: [] });
    const button = screen.getByRole("button", { name: /add comment/i });
    expect(button).toBeDisabled();
  });

  it("should display the timestamp for each comment", () => {
    renderComponent({ comments: mockComments });
    const commentAuthor = screen.getByText("John Doe");
    const comment = commentAuthor.closest("div");
    expect(comment).toBeTruthy();
    expect(comment!.textContent).toMatch(/10/);
  });
});
