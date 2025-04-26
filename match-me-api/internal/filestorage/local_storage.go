package filestorage

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

// FileStorage defines the interface for file storage operations.
type FileStorage interface {
	SaveFile(fileHeader *multipart.FileHeader) (string, error)
	// Add other methods like DeleteFile if needed in the future
}

// LocalStorage handles saving files to the local filesystem.
var _ FileStorage = (*LocalStorage)(nil) // Compile-time check that LocalStorage implements FileStorage

type LocalStorage struct {
	BasePath string // The base directory where files are stored (e.g., "./uploads")
	BaseURL  string // The base URL path for accessing files (e.g., "/uploads")
}

// NewLocalStorage creates a new LocalStorage service.
// basePath is the filesystem path (e.g., cfg.FileStorage.BasePath)
// baseURL is the corresponding URL path (should typically match the last part of basePath)
func NewLocalStorage(basePath string, baseURL string) (*LocalStorage, error) {
	// Ensure the base directory exists
	err := os.MkdirAll(basePath, os.ModePerm)
	if err != nil {
		return nil, fmt.Errorf("failed to create storage directory '%s': %w", basePath, err)
	}
	return &LocalStorage{BasePath: basePath, BaseURL: baseURL},
		nil
}

// SaveFile saves the uploaded file and returns its relative web access URL.
func (ls *LocalStorage) SaveFile(fileHeader *multipart.FileHeader) (string, error) {
	if fileHeader == nil {
		return "", fmt.Errorf("no file provided")
	}

	// Generate a unique filename to prevent collisions
	ext := filepath.Ext(fileHeader.Filename)
	uniqueFilename := uuid.New().String() + ext

	// Construct the full destination path
	dstPath := filepath.Join(ls.BasePath, uniqueFilename)

	// Open the uploaded file
	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Create the destination file
	dst, err := os.Create(dstPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file '%s': %w", dstPath, err)
	}
	defer dst.Close()

	// Copy the uploaded file content to the destination file
	_, err = io.Copy(dst, src)
	if err != nil {
		// Attempt to remove partially written file on error
		os.Remove(dstPath)
		return "", fmt.Errorf("failed to copy file content to '%s': %w", dstPath, err)
	}

	// Construct the relative URL path for web access
	// Ensure BaseURL starts with / and doesn't end with /
	baseURL := ls.BaseURL
	if len(baseURL) > 0 && baseURL[len(baseURL)-1] == '/' {
		baseURL = baseURL[:len(baseURL)-1]
	}
	if len(baseURL) > 0 && baseURL[0] != '/' {
		baseURL = "/" + baseURL
	}
	fileURL := baseURL + "/" + uniqueFilename

	return fileURL, nil
}
