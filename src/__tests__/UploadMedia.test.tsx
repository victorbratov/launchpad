import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadMedia from "../app/uploadMedia/page";
import '@testing-library/jest-dom'
import { MantineProvider } from "@mantine/core";


beforeEach(() => jest.clearAllMocks());

// tests for succssful and failed file upload
describe("upload media component", () => {
  it("should drop with success message", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }); // mock fetch
    render(<MantineProvider><UploadMedia /></MantineProvider>);
    window.URL.createObjectURL = jest.fn().mockImplementation(() => "url");
    const inputEl = screen.getByTestId("dropzone");
    const file = new File(["file"], "img.png", {
      type: "image/png",
    });
    Object.defineProperty(inputEl, "files", {
      value: [file],
    });
    fireEvent.drop(inputEl);
    expect(await screen.findByTestId('success')).toHaveTextContent('Upload successful!');
  });

  // test error message on failed upload
  it("should show error on failed upload", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false}); // mock fetch
    render(<MantineProvider><UploadMedia /></MantineProvider>);
    window.URL.createObjectURL = jest.fn().mockImplementation(() => "url");
    const inputEl = screen.getByTestId("dropzone");
    const file = new File(["file"], "img.png", {
      type: "image/png",
    });
    Object.defineProperty(inputEl, "files", {
      value: [file],
    });
    fireEvent.drop(inputEl);
    expect(await screen.findByTestId('fail')).toHaveTextContent('Error uploading file');
  });
});

