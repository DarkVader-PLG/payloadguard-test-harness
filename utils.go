// Package main provides utility functions and types for the application server.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Config struct {
	Host     string
	Port     int
	Timeout  time.Duration
	LogLevel string
}

type Server struct {
	config  Config
	mux     *http.ServeMux
	started bool
}

type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func NewConfig() Config {
	return Config{
		Host:     "0.0.0.0",
		Port:     8080,
		Timeout:  30 * time.Second,
		LogLevel: "info",
	}
}

func NewServer(cfg Config) *Server {
	return &Server{
		config: cfg,
		mux:    http.NewServeMux(),
	}
}

func (s *Server) Start() error {
	if s.started {
		return fmt.Errorf("server already started")
	}
	addr := fmt.Sprintf("%s:%d", s.config.Host, s.config.Port)
	log.Printf("Starting server on %s", addr)
	s.started = true
	return http.ListenAndServe(addr, s.mux)
}

func (s *Server) Stop() {
	s.started = false
	log.Println("Server stopped")
}

func HandleRequest(mux *http.ServeMux, path string, handler http.HandlerFunc) {
	mux.HandleFunc(path, handler)
}

func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("WriteJSON error: %v", err)
	}
}

func main() {
	cfg := NewConfig()
	srv := NewServer(cfg)
	if err := srv.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
