# Privacy Policy & Documentation

**Last Updated: January 2026**

## Overview

LoLA (Local Large Language Model Assistant) is designed with privacy as its core principle. Unlike cloud-based AI assistants, LoLA operates entirely on your local machine, ensuring your data remains private and under your control.

## Our Privacy Commitment

**Your data is YOUR data. Period.**

- ✅ **100% Local Processing**: All AI operations happen on your device
- ✅ **Zero Data Collection**: We don't collect, store, or transmit your data
- ✅ **No Analytics**: No usage tracking, no telemetry, no statistics
- ✅ **No Internet Required**: Works completely offline after initial setup
- ✅ **Open Source**: Transparent code you can audit yourself

---

## What Data LoLA Stores

### Locally Stored Data

All of the following data is stored **only on your computer**:

#### 1. **Uploaded Documents**
- **Location**: `backend/uploads/` directory
- **What**: PDF, DOCX, TXT, CSV, XLSX files you upload
- **Purpose**: To enable RAG (Retrieval-Augmented Generation) features
- **Retention**: Until you manually delete them
- **Access**: Only accessible by you on your machine

#### 2. **Vector Embeddings**
- **Location**: `backend/storage/` directory
- **What**: Mathematical representations of your documents for semantic search
- **Purpose**: Fast document retrieval during conversations
- **Retention**: Persists until you clear the knowledge base
- **Note**: Embeddings are not human-readable text

#### 3. **Chat History**
- **Location**: Browser localStorage (web) or app storage (Electron)
- **What**: Your conversation sessions with LoLA
- **Purpose**: Maintain conversation context across sessions
- **Retention**: Until you delete sessions or clear browser data
- **Access**: Only you can view your chat history

#### 4. **Application Settings**
- **Location**: Browser localStorage or app configuration files
- **What**: Preferences (theme, RAG toggle, selected model)
- **Purpose**: Personalize your experience
- **Retention**: Persistent across sessions
- **Access**: Stored locally on your device

### What We DON'T Store

- ❌ Your personal information
- ❌ Your document contents on any server
- ❌ Your conversations or queries
- ❌ Usage analytics or telemetry
- ❌ IP addresses or device identifiers
- ❌ Cookies (except essential local storage)

---

## Data Flow & Processing

### How LoLA Works

```
Your Device Only
┌─────────────────────────────────────────────────┐
│                                                 │
│  1. You upload document → Stored locally       │
│  2. Document chunked → Embedded locally        │
│  3. Embeddings stored → Local vector DB        │
│  4. You ask question → Processed locally       │
│  5. Ollama generates response → Local LLM      │
│  6. Chat saved → Local storage                 │
│                                                 │
│  No network requests • No external servers     │
└─────────────────────────────────────────────────┘
```

### Network Communication

LoLA makes **zero network requests** during normal operation, with these exceptions:

#### Initial Setup Only
- **Ollama Model Downloads**: When you run `ollama pull`, models are downloaded once from Ollama's servers
- **After Download**: Models run entirely offline

#### Optional (User-Initiated)
- **Software Updates**: Checking for new LoLA versions (opt-in)
- **Documentation**: Links to external resources in README

**During Chat**: No internet connection required or used.

---

## Third-Party Services

### Ollama
- **What**: Open-source LLM runtime that runs models locally
- **Privacy**: Processes everything on your machine
- **Network**: Only contacts Ollama servers when downloading models
- **Data Sharing**: None - your prompts never leave your device
- **More Info**: [Ollama Privacy](https://ollama.com)

### No Other Services
LoLA does not integrate with or send data to:
- Cloud AI providers (OpenAI, Anthropic, Google, etc.)
- Analytics services (Google Analytics, Mixpanel, etc.)
- Crash reporting services
- Advertising networks
- Any external APIs

---

## Your Rights & Control

### Data Management

You have complete control over your data:

#### View Your Data
```bash
# Documents
ls backend/uploads/

# Vector store
ls backend/storage/

# Chat history (browser)
DevTools → Application → Local Storage → http://localhost:5173
```

#### Delete Your Data

**Delete Specific Documents**:
- Use the Documents tab in LoLA
- Click the delete icon (🗑️) next to any document

**Delete All Documents**:
```bash
# Stop LoLA first, then:
rm -rf backend/uploads/*
rm -rf backend/storage/*
```

**Delete Chat History**:
- Click "Clear" on individual sessions in LoLA
- Or clear browser/app storage manually

**Complete Reset**:
```bash
# Delete everything and start fresh
rm -rf backend/uploads/*
rm -rf backend/storage/*
# Clear browser local storage through DevTools
```

#### Export Your Data

All your data is already in plain formats on your computer:
- Documents: Original files in `backend/uploads/`
- Chats: Export via the export button (📥) in LoLA
- Settings: JSON in browser localStorage

---

## Security Considerations

### Data Protection

**Physical Security**:
- Your data is only as secure as your computer
- Use disk encryption (BitLocker, FileVault, LUKS)
- Lock your computer when away
- Regular backups recommended

**File Permissions**:
- LoLA stores data in your user directory
- Standard OS file permissions apply
- No special elevated privileges required

**Sensitive Documents**:
- If uploading sensitive documents, ensure your disk is encrypted
- Consider using LoLA on a dedicated machine for highly sensitive work
- Delete documents from LoLA when no longer needed

### Best Practices

1. **Keep LoLA Updated**: Security patches are released regularly
2. **Secure Your Device**: Use strong passwords and full-disk encryption
3. **Review Uploaded Files**: Periodically check `uploads/` folder
4. **Backup Important Data**: LoLA doesn't backup your documents automatically
5. **Be Cautious**: Only upload files from trusted sources

---

## Children's Privacy

LoLA does not knowingly collect data from anyone, including children under 13. Since LoLA operates locally without data collection, COPPA compliance concerns don't apply. However, parents should supervise children's use of AI tools.

---

## Privacy by Design

### Technical Measures

**No Telemetry Code**:
- No tracking pixels
- No analytics JavaScript
- No phone-home mechanisms
- Audit the source code yourself on GitHub

**Local-First Architecture**:
- FastAPI backend runs on `localhost`
- React frontend served locally
- All processing in-memory or on-disk locally
- No external API dependencies

**Data Minimization**:
- Only stores what's necessary for functionality
- No redundant copies
- Easy deletion mechanisms
- No hidden caches

---

## Comparisons

### LoLA vs. Cloud AI Assistants

| Feature | LoLA | ChatGPT/Claude/Gemini |
|---------|------|----------------------|
| **Data Location** | Your device only | Company servers |
| **Internet Required** | No (after setup) | Yes, always |
| **Data Collection** | None | Yes, for training |
| **Privacy** | 100% private | Depends on ToS |
| **Data Retention** | Until you delete | Per company policy |
| **Third-Party Access** | Impossible | Possible |
| **Offline Use** | ✅ Yes | ❌ No |

---

## Transparency

### What We Know About You

**Nothing.** We literally cannot see:
- What documents you upload
- What questions you ask
- How you use LoLA
- Your device information
- Your location

### Open Source Verification

LoLA is fully open source under Apache 2.0:
- **GitHub**: [github.com/yourusername/LoLA](https://github.com/yourusername/LoLA)
- **Audit the Code**: Every line is public
- **Build from Source**: Compile it yourself to verify
- **Community Review**: Welcomed and encouraged

---

## Changes to This Policy

Since LoLA is a local application that doesn't collect data, this policy is unlikely to change materially. However:

- **Minor Updates**: Clarifications and improvements
- **Major Changes**: Would require a new version release
- **Notification**: Via GitHub releases and README updates

**Version History**:
- v1.0 (January 2026): Initial privacy documentation

---

## Contact & Questions

### Privacy Questions

For questions about privacy or data handling:
- **GitHub Issues**: [Open an issue](https://github.com/yourusername/LoLA/issues)
- **GitHub Discussions**: [Start a discussion](https://github.com/yourusername/LoLA/discussions)
- **Email**: [your-email@example.com]

### Security Concerns

For security vulnerabilities, see our [Security Policy](SECURITY.md).

---

## Legal Compliance

### GDPR (European Union)
- **Data Controller**: You are (it's your local device)
- **Data Processing**: All local, no processors involved
- **Right to Access**: You have full file system access
- **Right to Erasure**: Delete files anytime
- **Data Portability**: Files are already in standard formats

### CCPA (California)
- **Data Sales**: We don't collect data, so nothing to sell
- **Data Sharing**: Impossible - everything is local
- **Opt-Out**: Not applicable - no data collection

### Other Jurisdictions
Since LoLA doesn't collect, transmit, or store data on external servers, most data protection regulations don't apply in the traditional sense. You maintain full control and responsibility for your local data.

---

## Summary

**The Short Version**:

LoLA is designed to be the most private AI assistant possible. Your documents, conversations, and data never leave your computer. We can't see your data because we literally don't have access to it. Everything runs locally, offline, and under your complete control.

**Privacy = Freedom**

If you value:
- 🔒 Data privacy
- 🏠 Local-first computing
- 🔓 Open source transparency
- 🚫 No vendor lock-in
- ✅ Complete control

Then LoLA is built for you.

---

**Questions?** Open an issue on GitHub. We're happy to clarify anything about how LoLA handles (or rather, doesn't handle) your data.

<div align="center">
<strong>Your Data. Your Device. Your Privacy.</strong>
</div>
