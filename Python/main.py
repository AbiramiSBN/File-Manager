import os
import sys
import subprocess
import customtkinter as ctk
from pathlib import Path

# Configure dark appearance and theme
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("dark-blue")

class FileManager(ctk.CTk):
    def __init__(self, start_dir=None):
        super().__init__()
        self.title("File Manager")
        self.geometry("900x700")
        self.configure(fg_color="#2f3136")  # Discord-like background

        # State
        self.history = []
        self.current_dir = Path(start_dir or Path.home())

        # --- Top Bar ---
        top_bar = ctk.CTkFrame(self, fg_color="#202225", height=40)
        top_bar.pack(fill="x")

        self.back_btn = ctk.CTkButton(
            top_bar, text="← Back", width=80,
            command=self._on_back, corner_radius=5,
            fg_color="#5865f2", hover_color="#4752c4"
        )
        self.back_btn.pack(side="left", padx=10, pady=5)
        self.back_btn.configure(state="disabled")

        self.path_label = ctk.CTkLabel(
            top_bar, text=str(self.current_dir),
            text_color="#ffffff", anchor="w"
        )
        self.path_label.pack(side="left", fill="x", expand=True, padx=(10,0))

        # --- Content Area ---
        self.scrollable_frame = ctk.CTkScrollableFrame(self, fg_color="#2f3136")
        self.scrollable_frame.pack(fill="both", expand=True, padx=20, pady=(10,20))

        # Show initial directory
        self._populate()

    def _populate(self):
        # Clear previous buttons
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()

        entries = []
        try:
            entries = sorted(
                self.current_dir.iterdir(),
                key=lambda p: (not p.is_dir(), p.name.lower())
            )
        except PermissionError:
            ctk.CTkMessageBox.show_error(
                title="Access Denied",
                message=f"Cannot access {self.current_dir}"
            )
            return

        # Update path label
        self.path_label.configure(text=str(self.current_dir))

        # Create buttons for each entry
        for entry in entries:
            btn = ctk.CTkButton(
                self.scrollable_frame,
                text=entry.name,
                width=0,
                height=40,
                corner_radius=5,
                fg_color="#36393f",
                hover_color="#4f545c",
                anchor="w",
                command=lambda e=entry: self._on_item(e)
            )
            btn.pack(fill="x", pady=5)

        # Adjust Back button state
        if self.history:
            self.back_btn.configure(state="normal")
        else:
            self.back_btn.configure(state="disabled")

    def _on_item(self, path: Path):
        if path.is_dir():
            self.history.append(self.current_dir)
            self.current_dir = path
            self._populate()
        else:
            self._open_file(path)

    def _on_back(self):
        if not self.history:
            return
        self.current_dir = self.history.pop()
        self._populate()

    def _open_file(self, path: Path):
        try:
            if sys.platform == 'darwin':
                subprocess.run(['open', str(path)], check=False)
            elif sys.platform.startswith('win'):
                os.startfile(str(path))
            else:
                subprocess.run(['xdg-open', str(path)], check=False)
        except Exception as e:
            ctk.CTkMessageBox.show_error(
                title="Error",
                message=f"Failed to open {path}: {e}"
            )

if __name__ == '__main__':
    app = FileManager()
    app.mainloop()