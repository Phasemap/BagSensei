from typing import Dict
from pydantic import BaseModel, Field, validator


BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def is_base58(s: str) -> bool:
    # simple base58 validation without checksum
    return all(ch in BASE58_ALPHABET for ch in s)


class WalletBehaviorForm(BaseModel):
    """
    Form for analyzing Solana wallet behavior
    focuses on connected wallets, token activity, and flow directions
    """

    wallet_address: str = Field(..., description="Solana wallet public key")
    depth: int = Field(default=2, ge=1, le=5, description="Depth of connected wallet scan")
    analyze_tokens: bool = Field(default=True, description="Enable token-level analysis")
    scan_inbound_outbound: bool = Field(default=True, description="Scan both inbound and outbound flows")
    include_program_accounts: bool = Field(default=False, description="Include program accounts in traversal")

    @validator("wallet_address", pre=True)
    def strip_address(cls, v: str) -> str:
        # trim whitespace and common copy artifacts
        return v.strip()

    @validator("wallet_address")
    def validate_address(cls, v: str) -> str:
        if not (32 <= len(v) <= 44):
            raise ValueError("Invalid wallet address length")
        if not is_base58(v):
            raise ValueError("Wallet address must be valid base58")
        return v

    def to_payload(self) -> Dict[str, object]:
        # normalized payload for downstream services
        return {
            "wallet_address": self.wallet_address,
            "depth": self.depth,
            "analyze_tokens": self.analyze_tokens,
            "scan_inbound_outbound": self.scan_inbound_outbound,
            "include_program_accounts": self.include_program_accounts,
        }

    class Config:
        anystr_strip_whitespace = True
        allow_population_by_field_name = True
        extra = "forbid"
