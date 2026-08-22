import torch
from pydantic import BaseModel, Field

class GPUCapabilities(BaseModel):
    device: str = "cpu"
    cudaAvailable: bool = False
    gpuName: str = "None (CPU Execution Mode)"
    vramGB: float = 0.0

    @classmethod
    def detect(cls) -> "GPUCapabilities":
        is_cuda = torch.cuda.is_available()
        return cls(
            device="cuda" if is_cuda else "cpu",
            cudaAvailable=is_cuda,
            gpuName=torch.cuda.get_device_name(0) if is_cuda else "None (CPU Execution Mode)",
            vramGB=round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2) if is_cuda else 0.0
        )
