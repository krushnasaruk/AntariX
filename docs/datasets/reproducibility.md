# Dataset Reproducibility & Episode-Safe Splitting

This document details seed-controlled reproducibility and episode-safe train/val/test splitting.

---

## 1. Reproducibility Guarantee

Same seed + same distribution = **100% identical dataset manifest, SHA256 checksum, and Parquet records**.

## 2. Episode-Safe Splitting

To prevent temporal telemetry data leakage across train, validation, and test sets, splitting is performed strictly by **EPISODE ID** rather than individual timesteps.
