import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PostCard from "../../src/components/PostCard";

describe("PostCard", () => {
  const post = {
    id: 1,
    title: "Test post",
    body: "Test post body",
    liked: false,
    reactions: {
      likes: 10,
      dislikes: 2,
    },
  };

  it("renders post content and like button", () => {
    render(
      <PostCard
        post={post}
        isAuthenticated={false}
        onLike={jest.fn()}
      />
    );

    expect(screen.getByText("Test post")).toBeInTheDocument();
    expect(screen.getByText("Test post body")).toBeInTheDocument();
    expect(screen.getByText("Curtidas: 10")).toBeInTheDocument();
    expect(screen.getByText("Descurtidas: 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /curtir/i })).toBeInTheDocument();
  });

  it("calls onLike and shows liked feedback for authenticated users", async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);

    render(
      <PostCard
        post={post}
        isAuthenticated={true}
        onLike={onLike}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /curtir/i }));

    await waitFor(() => {
      expect(onLike).toHaveBeenCalledWith(1);
    });
    expect(screen.getByRole("button", { name: /curtido/i })).toBeInTheDocument();
  });
});
