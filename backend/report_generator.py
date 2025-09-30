import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Union, List, Optional


def validate_serializable(data: Any) -> bool:
    """
    Validate if the provided data is JSON serializable.

    Args:
        data: Any Python object.

    Returns:
        bool: True if the object is serializable, False otherwise.
    """
    try:
        json.dumps(data)
        return True
    except (TypeError, OverflowError):
        return False


def create_report_structure(
    data: Union[Dict[str, Any], List[Any]],
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create the full report structure with timestamp, summary, and optional metadata.

    Args:
        data: Report body (dict or list).
        metadata: Additional information such as author, project, or tags.

    Returns:
        dict: A complete report ready for serialization.
    """
    return {
        "timestamp": datetime.now().astimezone().isoformat(),
        "summary": data,
        "metadata": metadata or {},
    }


def generate_json_report(
    data: Union[Dict[str, Any], List[Any]],
    filename: Union[str, Path] = "report.json",
    encoding: str = "utf-8",
    metadata: Optional[Dict[str, Any]] = None,
    overwrite: bool = True
) -> Path:
    """
    Generate a JSON report file with a timestamped envelope.

    Args:
        data: Any serializable object (dict, list, etc.) representing the report body.
        filename: Output filename (string or Path). Defaults to "report.json".
        encoding: File encoding. Defaults to "utf-8".
        metadata: Optional metadata dictionary (author, tags, etc.).
        overwrite: If False, append timestamp to filename instead of overwriting.

    Returns:
        Path: Path to the created JSON report file.

    Raises:
        ValueError: If the provided data is not serializable.
    """
    if not validate_serializable(data):
        raise ValueError("Provided data is not JSON serializable")

    report = create_report_structure(data, metadata)
    file_path = Path(filename)

    # Handle non-overwrite behavior by appending timestamp
    if not overwrite and file_path.exists():
        stem = file_path.stem
        suffix = file_path.suffix or ".json"
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = file_path.with_name(f"{stem}_{timestamp_str}{suffix}")

    # Ensure directory exists
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Write the report to file
    with file_path.open("w", encoding=encoding) as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    return file_path


def load_json_report(filename: Union[str, Path], encoding: str = "utf-8") -> Dict[str, Any]:
    """
    Load a JSON report from a file.

    Args:
        filename: Path to the JSON file.
        encoding: File encoding. Defaults to "utf-8".

    Returns:
        dict: Parsed JSON content.
    """
    file_path = Path(filename)
    if not file_path.exists():
        raise FileNotFoundError(f"Report file not found: {file_path}")

    with file_path.open("r", encoding=encoding) as f:
        return json.load(f)


def pretty_print_report(report: Dict[str, Any]) -> None:
    """
    Print the report content in a human-readable format.

    Args:
        report: Report dictionary to be printed.
    """
    print(json.dumps(report, ensure_ascii=False, indent=2))


# Example usage for testing
if __name__ == "__main__":
    example_data = {"task": "Generate JSON report", "status": "Completed"}
    meta = {"author": "System", "tags": ["json", "report", "utility"]}

    path = generate_json_report(
        data=example_data,
        filename="output/report.json",
        metadata=meta,
        overwrite=False
    )

    loaded = load_json_report(path)
    pretty_print_report(loaded)
