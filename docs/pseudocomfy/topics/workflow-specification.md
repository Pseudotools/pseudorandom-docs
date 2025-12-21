---
title: Workflow Specification
description: Documentation on how to structure Workflows in the Pseudorandom ecosystem.
---

# Pseudotools Workflow Scheme Authoring Guide

*Schema version 0.3*

This document describes how each workflow scheme JSON file is structured for the **pt-essential-workflows** repository.  
It is intended for authors creating or editing workflows so that they integrate smoothly with Pseudotools runners, user interfaces, and the new snapshot format.

---

## 1 • Overview

Every workflow scheme JSON file defines:

1. **Metadata** – name, description, optional thumbnail and rank order.
2. **Attribution** – authorship information for the workflow itself.
3. **Global Guidance Capabilities** – which user-defined global prompts (`txt_scene`, `txt_style`, `txt_negative`, `img_style`) the workflow accepts.
4. **Regional Guidance Capabilities** – which region-specific prompts (`txt`, `img`) the workflow accepts.
5. **Spatial Guidance Capabilities** – which model-derived full-frame maps (`depth`, `edge`, …) the workflow can use.
6. **Variables** – tunable parameters that bind to tokens inside the ComfyUI graph.
7. **Endpoint Requirements** – external models or custom nodes needed at runtime.
8. **Workflow Graph** – the complete ComfyUI node graph that generates imagery.

---

## 2 • Top-Level Fields

| Field                                       | Type            | Purpose                                                                                                          |
| ------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`type`**                                  | string          | Workflow engine family. For ComfyUI workflows use `"comfy"`.                                                     |
| **`name`**                                  | string          | Human-readable title shown in menus and UIs.                                                                     |
| **`description`**                           | string          | One-line summary of what the workflow does or which model family it targets.                                     |
| **`pseudorandom_workflow_schema_version`**  | number          | Schema version; set to `0.3` for this format.                                                                    |
| **`attribution`**                           | object          | Workflow authorship information (see §3).                                                                       |
| **`thumbnail`**                             | string (base64) | Optional preview image shown in user interfaces. Displayed as 512px square, dimensions must be 256px minimum.    |
| **`rank_order`**                            | number          | Optional integer to control display ordering within a larger library; workflows without a value fall to the end. |
| **`global_guidance_capabilities`**          | object          | Declares which global prompts are supported (see §4).                                                            |
| **`regional_guidance_capabilities`**        | object          | Declares which per-region prompts are supported (see §5).                                                        |
| **`spatial_guidance_capabilities`**         | object          | Declares which model-derived full-frame guidance maps are supported (see §6).                                    |
| **`variables`**                             | array           | Tunable parameters (see §7).                                                                                     |
| **`endpoint_requirements`**                 | array           | External resources required (see §8).                                                                            |
| **`workflow`**                              | object          | The ComfyUI node graph (the 'workflow') itself (see §9).                                                         |

> **ID note:** A workflow scheme's ID is **derived from its filename** (e.g. `sdlt-realviz50-ip.json`) and is not specified inside the JSON.

---

## 3 • Attribution

The `attribution` object describes the authorship of the workflow itself (distinct from the attribution of endpoint requirements).

### Structure

```json
"attribution": {
  "author": "John Doe",                    // REQUIRED: Name of workflow author/creator
  "author_url": "https://example.com/johndoe",  // OPTIONAL: Link to author's profile/page
  "license": "MIT"                         // OPTIONAL: License for the workflow (e.g., "MIT", "CC-BY-4.0")
}
```

### Field Details

**Required Fields:**
- `author`: Name of the workflow author/creator

**Optional Fields:**
- `author_url`: URL to the author's profile, website, or contact page
- `license`: License identifier for the workflow itself (e.g., `"MIT"`, `"CC-BY-4.0"`, `"Proprietary"`). This is separate from endpoint requirement licenses.

### Examples

**Minimal Attribution:**
```json
{
  "attribution": {
    "author": "Jane Smith"
  }
}
```

**Full Attribution:**
```json
{
  "attribution": {
    "author": "John Doe",
    "author_url": "https://github.com/johndoe",
    "license": "MIT"
  }
}
```

### Key Points

- **Workflow vs. Resource Attribution**: The `attribution` object describes who created the workflow JSON file itself. This is separate from the `attribution` fields in endpoint requirement provenance, which describe the creators of the models/nodes used by the workflow.
- **License Scope**: The `license` field applies to the workflow definition (the JSON structure and node graph), not to the resources it requires.

---

## 4 • Global Guidance Capabilities

These correspond to the `global_guidance` object in a snapshot.

```json
"global_guidance_capabilities": {
  "txt_scene":    true | false,
  "txt_style":    true | false,
  "txt_negative": true | false,
  "img_style":    true | false
}
```

* **txt\_scene** – overall program, massing, composition.
* **txt\_style** – global look/lighting/lens descriptors.
* **txt\_negative** – elements to avoid globally.
* **img\_style** – image equivalent of `txt_style`, a full-frame style reference.

---

## 5 • Regional Guidance Capabilities

These correspond to the `regional_guidance` array in a snapshot.

```json
"regional_guidance_capabilities": {
  "text":  true | false,
  "image": true | false
}
```

* **text** – region-specific material or object prompts.
* **image** – region-specific reference images.

At least one of these capabilities must be `true`. Masks are implicitly required for every regional prompt and do not need to be declared.

---

## 6 • Spatial Guidance Capabilities

These correspond to the `spatial_guidance` object in a snapshot.

```json
"spatial_guidance_capabilities": {
  "depth": true,
  "edge":  false
}
```

* **depth** – `true` if the workflow can consume a grayscale depth map for geometry guidance, false otherwise.
* **edge** – `true` if the workflow can consume an edge or linework map for contour guidance, false otherwise.
* *(future keys)* – additional model-derived maps such as `normal`, `albedo`, etc., may be added later following the same pattern.

Runners use this section to:

* validate that a snapshot provides the needed spatial guidance,
* drive the UI (for example, enabling depth or edge upload controls only when supported).

---

## 7 • Variables

Variables expose parameters that can be tuned at runtime and substituted directly into the ComfyUI graph.

### Structure

```json
{
  "name": "Sampling Steps",                    // REQUIRED: Human-readable name
  "type": "int",                               // REQUIRED: int | float | bool | string
  "is_basic": false                            // OPTIONAL: Flag for UI mode; default = true if missing
  "description": "Number of denoising steps.", // REQUIRED: Concise description for UI help
  "default": 30,                               // REQUIRED: Default value (must match type)
  "binds_to": "__STEPS__",                     // REQUIRED: Token to replace in workflow
  "min": 10,                                   // OPTIONAL: Minimum value (int/float only)
  "max": 100,                                  // OPTIONAL: Maximum value (int/float only)
  "step": 1,                                   // OPTIONAL: Step size (int/float only)
  "enum_options": {                            // OPTIONAL: Key-value pairs for dropdowns
    "euler": "Euler sampler",
    "ddim": "DDIM sampler",
    "dpmpp_2m": "DPM++ 2M sampler"
  }
}
```

### Field Details

**Required Fields:**
- `name`: Human-readable variable name displayed in UI
- `type`: Variable data type (`"int"`, `"float"`, `"bool"`, or `"string"`)
- `description`: Brief explanation for UI tooltips and AI assistance
- `default`: Default value that must match the specified type
- `binds_to`: Exact token in the workflow graph to replace (e.g., `"__STEPS__"`)

**Optional Fields:**
- `is_basic`: boolean flag that indicates whether this variable should appear in the UI's basic panel. If not present, defaults to true. Set to false to group it under advanced/expert controls.
- `min`/`max`: Value constraints for numeric types (`int`, `float`)
- `step`: Increment size for numeric inputs (defaults: int=1, float=0.1)
- `enum_options`: Dropdown options as key→label pairs (overrides min/max/step)

### Examples by Type

**Integer Variable:**
```json
{
  "name": "Sampling Steps",
  "type": "int",
  "description": "Number of denoising steps for image generation.",
  "is_basic": true,
  "default": 30,
  "binds_to": "__STEPS__",
  "min": 10,
  "max": 100,
  "step": 5
}
```

**Float Variable:**
```json
{
  "name": "CFG Scale",
  "type": "float", 
  "description": "Classifier-free guidance scale for prompt adherence.",
  "is_basic": false,
  "default": 7.5,
  "binds_to": "__CFG_SCALE__",
  "min": 1.0,
  "max": 20.0,
  "step": 0.5
}
```

**Boolean Variable:**
```json
{
  "name": "High Resolution",
  "type": "bool",
  "description": "Enable high-resolution image generation.",
  "is_basic": true,
  "default": false,
  "binds_to": "__HIGH_RES__"
}
```

**String Variable with Enum Options:**
```json
{
  "name": "Sampler Method",
  "type": "string",
  "description": "Algorithm used for denoising process.",
  "default": "euler",
  "binds_to": "__SAMPLER__",
  "enum_options": {
    "euler": "Euler - Fast and stable",
    "ddim": "DDIM - Deterministic sampling", 
    "dpmpp_2m": "DPM++ 2M - High quality",
    "heun": "Heun - Improved accuracy"
  }
}
```

### Key Points

* **Type Consistency**: The `default` value and `enum_options` keys must match the declared `type`
* **Token Matching**: Each `binds_to` token must appear exactly once in the `workflow` graph
* **Range Validation**: Values are automatically clamped to `min`/`max` bounds when set
* **UI Generation**: The UI automatically creates appropriate controls (sliders, dropdowns, checkboxes) based on the variable configuration
* **State Persistence**: Variable values are saved in render results and restored when loading

### Validation Rules

1. **Required fields** must be present and non-empty
2. **Type validation**: `default` value must be convertible to the specified `type`
3. **Range validation**: If `min`/`max` are specified, `default` must be within bounds
4. **Token uniqueness**: Each `binds_to` token must be unique across all variables
5. **Enum consistency**: When `enum_options` is provided, `default` must be one of the keys

---

## 8 • Endpoint Requirements

Declare which resources must be available to run the workflow. Each requirement is an object with category, requirement string, and provenance information.

### Structure

```json
"endpoint_requirements": [
  {
    "category": "checkpoints",                    // REQUIRED: Resource category
    "requirement": "RealVis_5.0.safetensors",     // REQUIRED: Resource identifier to match
    "description": "Primary model for...",       // OPTIONAL: Human-readable description
    "notes": "Requires 8GB VRAM",                 // OPTIONAL: Additional notes or warnings
    "provenance": {                               // REQUIRED: Provenance object (must exist)
      "download_url": "https://...",              // REQUIRED: Download URL
      "attribution": "Created by...",             // OPTIONAL: Attribution text
      "attribution_url": "https://...",           // OPTIONAL: Attribution page URL
      "license": "MIT",                           // OPTIONAL: License identifier
      "data_provenance_notes": "Trained on...",   // OPTIONAL: Notes about training data source
      "data_provenance_sources": [                // OPTIONAL: List of URLs to training data sources
        "https://example.com/dataset1",
        "https://example.com/dataset2"
      ],
      "size_bytes": 4294967296,                   // OPTIONAL: File size in bytes
      "last_downloaded_yymmdd": "241215"          // OPTIONAL: Last download date (YYMMDD)
    }
  }
]
```

### Field Details

**Required Fields:**
- `category`: Resource category (`"checkpoints"`, `"custom_nodes"`, `"controlnet"`, `"ipadapter"`, etc.)
- `requirement`: Exact identifier to match against server affordances (e.g., `"model.safetensors"`, `"pseudocomfy"`)
- `provenance`: Object containing provenance information (must exist)

**Required in Provenance:**
- `download_url`: URL to download the resource

**Optional Fields (Top Level):**
- `description`: Human-readable description of the requirement
- `notes`: Additional notes or warnings

**Optional Fields (Provenance):**
- `attribution`: Attribution/credit text
- `attribution_url`: URL for attribution/credit page
- `license`: License type (e.g., `"MIT"`, `"CreativeML Open RAIL-M"`)
- `data_provenance_notes`: Notes about training data source (e.g., dataset used, data origin). Automatically truncated to 512 characters if longer during deserialization. Not applicable for data-free requirements like custom nodes
- `data_provenance_sources`: Array of URLs to training data sources. URLs are validated during deserialization; invalid URLs log a warning but are included. Not applicable for data-free requirements like custom nodes
- `size_bytes`: File size in bytes (integer)
- `last_downloaded_yymmdd`: Last download date in `"YYMMDD"` format

### Examples

**Checkpoint Requirement:**
```json
{
  "category": "checkpoints",
  "requirement": "RealVis_5.0.safetensors",
  "description": "High-quality photorealistic model",
  "notes": "Requires at least 8GB VRAM",
  "provenance": {
    "download_url": "https://example.com/models/realvis-5.0.safetensors",
    "attribution": "Created by RealVis Team",
    "attribution_url": "https://example.com/realvis",
    "license": "CreativeML Open RAIL-M",
    "data_provenance_notes": "Trained on LAION-5B subset with architectural images",
    "data_provenance_sources": [
      "https://laion.ai/blog/laion-5b/",
      "https://example.com/architectural-dataset"
    ],
    "size_bytes": 4294967296
  }
}
```

**Custom Node Requirement:**
```json
{
  "category": "custom_nodes",
  "requirement": "pseudocomfy",
  "description": "Pseudorandom integration node for ComfyUI",
  "provenance": {
    "download_url": "https://github.com/user/pseudocomfy"
  }
}
```

**Minimal Requirement (Only Required Fields):**
```json
{
  "category": "controlnet",
  "requirement": "depth-model-v21",
  "provenance": {
    "download_url": "https://example.com/controlnet/depth-v21.safetensors"
  }
}
```

### Key Points

- **Case Sensitivity**: `custom_nodes` entries are matched case-insensitively (converted to lowercase). All other categories are case-sensitive.
- **Matching Logic**: Runners match `requirement` values against server affordances by category. The `requirement` string must exactly match (case-sensitive except for `custom_nodes`).
- **Pre-flight Checks**: Runners should validate requirements before execution and report missing resources with details from the `provenance` object.
- **Provenance Object**: The `provenance` object must always be present, even if only `download_url` is provided. All other provenance fields are optional.
- **Data Provenance**: The `data_provenance_notes` and `data_provenance_sources` fields are intended for models trained on datasets. For data-free requirements like custom nodes, these fields are not applicable and should be omitted.
- **URL Validation**: The `data_provenance_sources` field contains URLs that are validated during deserialization. Invalid URLs log a warning but are included to avoid breaking workflows with minor formatting issues.

### Validation Rules

1. **Required fields** must be present: `category`, `requirement`, and `provenance` (with `download_url` inside)
2. **Category validation**: Must be a recognized category type
3. **Provenance object**: Must exist and contain at least `download_url`
4. **Date format**: If `last_downloaded_yymmdd` is provided, it must be in `"YYMMDD"` format (e.g., `"241215"` for December 15, 2024)
5. **URL validation**: URLs in `data_provenance_sources` are validated for proper format (http:// or https://). Invalid URLs are logged as warnings but included in the data structure
6. **Character limit**: `data_provenance_notes` is automatically truncated to 512 characters if longer during deserialization

---

## 9 • Workflow Graph

The `workflow` field holds the full **ComfyUI node graph** exported from the ComfyUI interface.

Inside the graph, variables are injected by replacing special tokens.

### Required Tokens

The workflow graph **must contain** the following runtime tokens (provided by the runner):

* `__PSEUDORANDOM_TEMP_PATH__` – a temporary writable directory for intermediate files.
* `__PSEUDORANDOM_SEED__` – a reproducible random seed value.

### Variable Tokens

Additional tokens (e.g., `__STEPS__`, `__CFG__`, `__SAMPLER__`) are **only required** when specified in a variable's `binds_to` field. If a variable defines `"binds_to": "__STEPS__"`, then the workflow graph must contain that token. Tokens not referenced by any variable are not required.

### Token Rules

* No other reserved tokens are supported beyond those listed above.
* Each token referenced in a variable's `binds_to` must appear exactly once in the workflow graph.

---

## 10 • Authoring Checklist

1. Name the file descriptively; the **ID is taken from the filename**.
2. Provide a clear **name** and **description** inside the JSON.
3. Include required **attribution** with at least the `author` field.
4. Add an optional **thumbnail** image and/or **rank\_order** if needed for display.
5. Declare **global\_guidance\_capabilities**, **regional\_guidance\_capabilities**, and **spatial\_guidance\_capabilities** exactly.
6. Define **variables** with precise `description`s and correct `binds_to` tokens.
7. List all required models or nodes in **endpoint\_requirements**.
8. Export the ComfyUI graph and insert it into the `workflow` field, using only the supported variable tokens.

---

## 11 • Versioning

* Current schema: **0.3**.
* Update `schema_version` only when the schema itself changes.
* Incrementing is **not required** for normal graph or default-value tweaks.

---

## Summary of Changes from v0.2

* **Schema version**: Updated from 0.2 to 0.3
* **Attribution**: Added required top-level `attribution` object with `author` (required), `author_url` (optional), and `license` (optional)
* **Endpoint Requirements**: Changed from dictionary format to array of objects with provenance subobject
* **Data Provenance**: Added `data_provenance_sources` array field; `data_provenance_notes` automatically truncated to 512 characters

---