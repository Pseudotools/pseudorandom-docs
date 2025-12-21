---
title: Library Specification
description: Documentation on how to structure Libraries in the Pseudorandom ecosystem.
---


## Purpose

* **Central source of ready-to-use workflows**
  Each JSON file at the top level describes a complete rendering pipeline (scene setup, style and negative prompts, and tunable variables) following the Pseudotools workflow schema.

* **Reusable prompt and material collections**
  Shared environment prompts and material definitions provide consistent vocabulary and reference data across workflows.

* **Seamless CAD integration**
  CAD software can load the library directly from GitHub (public or private), present thumbnails and variables in its UI, and run the contained workflows without extra configuration.

---

## Library Repository Structure

Pseudorandom Libraries adopt a **flat, predictable layout**:

```
pt-sample-library/
├─ README.md                    # required: library overview, attribution, workflow docs
├─ LIBRARY.json                 # minimal library manifest
├─ <workflow-a>.json            # individual workflows (one per file)
├─ <workflow-b>.json
├─ global_guidance/
│  ├─ prompt_library.json       # consolidated prompt definitions
│  └─ style_image/              # reference images; filenames are the keys
│     ├─ portra-800.jpg
│     ├─ cine-sky.png
│     └─ ...
└─ regional_guidance/
   ├─ oak-plank.json            # each material is a single JSON file
   ├─ brushed-aluminum.json
   └─ ...
```

### README.md

A **README.md** file is required at the repository root. This file serves multiple purposes:

* **Library Overview** – Provides a high-level description of the library's intent, purpose, and use cases.
* **Attribution & Authorship** – Documents who created the library, licensing information, and any credits or acknowledgments.
* **Workflow Documentation** – Each workflow included in the library **MUST** have a corresponding header element (h1, h2, h3, etc.) with the exact workflow display name (not the filename, but rather the 'name' defined in the workflow JSON). These headers automatically generate GitHub anchor links that the software application uses to provide contextual help.

#### README Structure Requirements

1. **Library Overview Section** – Describe what the library provides and its intended use cases.
2. **Attribution Section** – Include author information, license, and any credits.
3. **Workflows Section** – List each workflow with a header element. The header text must exactly match the exact workflow display name (not the filename, but rather the 'name' defined in the workflow JSON).

#### Example README Structure

```markdown
# Pseudotools Essential Workflows

This library provides core rendering workflows and prompt presets for architectural visualization using Pseudorandom.

## Overview

This library contains production-ready workflows optimized for architectural rendering, including scene setup, style conditioning, and material definitions. All workflows follow the Pseudotools v0.2 schema and are designed for seamless integration with CAD software.

The workflows in this library are designed to work out-of-the-box with minimal configuration, while still providing extensive customization options through tunable variables.

## Attribution

**Author:** Pseudotools Team  
**License:** MIT  
**Version:** 1.0.0  
**Repository:** https://github.com/pseudotools/essential-workflows

### Credits

- Workflow designs based on community feedback and architectural visualization best practices
- Prompt libraries curated from open-source collections
- Material definitions adapted from real-world material databases

## Workflows

Each workflow below corresponds to a JSON file in this repository. The workflow name links to detailed documentation that appears in the software application when users select that workflow.

### Architectural Daytime

**File:** `architectural-daytime.json`

A daytime architectural visualization workflow with natural lighting and realistic materials. Optimized for exterior building renders.

**Key Features:**
- Natural daylight simulation with adjustable sun position
- Realistic material rendering with PBR properties
- Adjustable time-of-day parameters (morning, noon, afternoon)
- Automatic sky and environment mapping

**Recommended Use Cases:**
- Exterior building presentations
- Site planning visualizations
- Daylight analysis renders

### Architectural Nighttime

**File:** `architectural-nighttime.json`

Nighttime architectural visualization with artificial lighting and atmospheric effects.

**Key Features:**
- Artificial lighting controls for interior and exterior lights
- Atmospheric fog and haze effects
- Enhanced contrast for night scenes
- Warm/cool lighting temperature options

**Recommended Use Cases:**
- Nighttime building presentations
- Interior lighting studies
- Dramatic architectural photography

### Product Render

**File:** `product-render.json`

High-quality product rendering workflow suitable for product visualization and marketing materials.

**Key Features:**
- Studio lighting setup with multiple light sources
- Clean background options (white, gray, transparent)
- Material showcase mode with enhanced reflections
- Focus stacking support for maximum sharpness

**Recommended Use Cases:**
- Product catalogs
- E-commerce imagery
- Marketing materials

### Interior Residential

**File:** `interior-residential.json`

Residential interior visualization workflow with warm, inviting lighting and realistic material textures.

**Key Features:**
- Warm interior lighting simulation
- Realistic fabric and wood material definitions
- Adjustable window lighting intensity
- Post-processing color grading options

**Recommended Use Cases:**
- Residential interior design presentations
- Real estate visualization
- Furniture placement studies
```

**Important Notes:**

* Header text (e.g., `### Architectural Daytime`) must **exactly match** the workflow display name (the `name` field in the workflow JSON file, not the filename).
* The **File:** line shows the corresponding JSON filename for reference.
* GitHub automatically generates anchor links from headers (e.g., `#architectural-daytime`).
* The software application uses these anchor links to provide contextual help when users select workflows.
* Headers can be any level (h1-h6), but h2 or h3 are recommended for workflow names.

### LIBRARY.json

A single minimal manifest describing the library:

```json
{
  "schema_version": "0.2",
  "name": "Pseudotools Essential Workflows",
  "description": "Core workflows and prompt presets for architectural rendering."
}
```

* **schema\_version** must match the `pseudorandom_workflow_scheme_version` inside every workflow file.
* **name** and **description** provide basic metadata for UIs and loaders.
* No internal ID field is needed—IDs are derived from repository URLs and filenames.

### Workflows

* Each `*.json` file at the repository root is a complete workflow.
* Workflows follow the **v0.2 workflow schema** with optional `thumbnail` and `rank_order` fields.
* Only two reserved tokens are available inside each workflow's ComfyUI graph:

  * `__PSEUDORANDOM_TEMP_PATH__`
  * `__PSEUDORANDOM_SEED__`

### Global Guidance


Global guidance is defined **outside individual workflow schemes** in a single consolidated prompt library.
This supports consistent scene, style, and negative prompts across all workflows and makes it easier to maintain and extend prompt sets.

#### Files & Folders

* **`global_guidance/prompt_library.json`**
  The main prompt library file. It contains:

  * **`schema_version`** – Version of this prompt library schema (e.g. `"0.2"`).
  * **`defaults`** – Fallback selections for each category.

    * Each key (`scene`, `style`, `negative`, `style_image`) must match an item in the corresponding array (or filename for `style_image`).
    * If a key is missing or does not match, the **first element** of the array or directory is used instead.
  * **`scene`** – Array of objects with `name` and `prompt` defining scene prompt options.
  * **`style`** – Array of objects with `name` and `prompt` defining style prompt options.
  * **`negative`** – Array of objects with `name` and `prompt` defining negative prompt options.

* **`global_guidance/style_image/`**
  Folder of reference images used for style conditioning.

  * The **filename without extension** serves as the key (e.g. `solarpunk.jpg` → `"solarpunk"`).
  * The default style image is set in the `defaults.style_image` field.

---

#### Sample Prompt Library File

```json
{
  "schema_version": "0.2",
  "defaults": {
    "scene": "Beach",
    "style": "Quattro",
    "negative": "Sure",
    "style_image": "solarpunk.jpg"
  },
  "scene": [
    {"name": "Goto", "prompt": "modern architectural visualization with clean lines and geometric forms"},
    {"name": "Farm", "prompt": "a photo of a farm with a barn, silo, and fields"},
    {"name": "City", "prompt": "a photo of a city skyline with tall buildings and busy streets"},
    {"name": "Beach", "prompt": "a photo of a beach with sand, ocean, and palm trees"}
  ],
  "style": [
    {"name": "Uno", "prompt": "cotton candy colors, whimsical and playful"},
    {"name": "Due", "prompt": "french baroque style with ornate details and luxurious textures"},
    {"name": "Twa", "prompt": "lush hobbitseque greenery with rustic wooden elements"},
    {"name": "Quattro", "prompt": "kodachrome film still, 1976"}
  ],
  "negative": [
    {"name": "Sure", "prompt": "poor, low res, just nasty"},
    {"name": "One", "prompt": "low res, poorly drawn, deformed, blurry"},
    {"name": "Two", "prompt": "unrealistic, cartoonish, low res, poorly drawn, deformed, blurry"}
  ]
}
```


#### Authoring Guidelines

* Each `name` is the **display key** for UI selection and must be unique within its category.
* Prompts should be concise but descriptive, as they are directly injected into text-to-image models.
* When adding a new style image, place it in `style_image/` and reference the filename (without extension) in `defaults.style_image` if it should be the fallback.




### Regional Guidance

* Each file in `regional_guidance/` represents a single material and may contain:

  ```json
  {
    "schema_version": "0.2",       // same as library schema for now
    "name": "White Oak Plank",
    "text": "white oak planks, matte finish, tight grain",
    "image_base64": null,          // optional embedded reference image
    "rank_order": 120              // optional ordering hint
  }
  ```
