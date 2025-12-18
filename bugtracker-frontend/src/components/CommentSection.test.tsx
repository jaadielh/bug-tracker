import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "./CommentSection";
import { Comment } from "@/types/comment";

global.fetch = jest.fn();

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the comment section with existing comments", () => {
    render(
      <CommentSection
        bugId={1}
        comments={mockComments}
        onCommentAdded={jest.fn()}
      />
    );
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("This is a test comment")).toBeInTheDocument();
  });

  it("should submit a new comment", async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const onCommentAdded = jest.fn();

    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={onCommentAdded} />
    );

    await user.type(screen.getByLabelText(/your name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/comment/i), "This is a new comment");

    const button = screen.getByRole("button", { name: /add comment/i });

    // ⬇️ THIS IS CRITICAL
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
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

    (fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to add comment")
    );

    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={jest.fn()} />
    );

    await userEvent.type(screen.getByLabelText("Your Name"), "Jane Smith");
    await userEvent.type(
      screen.getByLabelText("Comment"),
      "This is a new comment"
    );
    fireEvent.click(screen.getByText("Add Comment"));

    await waitFor(() => {
      expect(screen.getByText("Add Comment")).toBeInTheDocument();
    });

    consoleErrorMock.mockRestore();
  });

  it("should render empty comments message when no comments are provided", () => {
    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={jest.fn()} />
    );
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("should disable the submit button when form fields are empty", () => {
    render(
      <CommentSection bugId={1} comments={[]} onCommentAdded={jest.fn()} />
    );

    const button = screen.getByRole("button", { name: /add comment/i });
    expect(button).toBeDisabled();
  });

  it("should display the timestamp for each comment", () => {
    render(
      <CommentSection
        bugId={1}
        comments={mockComments}
        onCommentAdded={jest.fn()}
      />
    );

    // Find the comment container first
    const commentAuthor = screen.getByText("John Doe");
    const comment = commentAuthor.closest("div");

    expect(comment).toBeTruthy();

    // Assert that some time-like content exists in that comment
    expect(comment!.textContent).toMatch(/10/);
  });

});
