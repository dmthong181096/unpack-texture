class TextureUnpacker {
    constructor() {
        this.plistFile = null;
        this.imageFile = null;
        this.atlasData = null;
        this.processedSprites = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.plistDropZone = document.getElementById('plistDropZone');
        this.imageDropZone = document.getElementById('imageDropZone');
        this.plistInput = document.getElementById('plistInput');
        this.imageInput = document.getElementById('imageInput');
        this.plistStatus = document.getElementById('plistStatus');
        this.imageStatus = document.getElementById('imageStatus');
        this.unpackBtn = document.getElementById('unpackBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.textureGrid = document.getElementById('textureGrid');
        this.resultsSection = document.getElementById('resultsSection');
        this.infoSection = document.getElementById('infoSection');
        this.atlasInfo = document.getElementById('atlasInfo');
    }

    bindEvents() {
        // Plist drag and drop events
        this.plistDropZone.addEventListener('dragover', (e) => this.handleDragOver(e, 'plist'));
        this.plistDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e, 'plist'));
        this.plistDropZone.addEventListener('drop', (e) => this.handleDrop(e, 'plist'));
        
        // Image drag and drop events
        this.imageDropZone.addEventListener('dragover', (e) => this.handleDragOver(e, 'image'));
        this.imageDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e, 'image'));
        this.imageDropZone.addEventListener('drop', (e) => this.handleDrop(e, 'image'));
        
        // Click events for drop zones (to trigger file input)
        this.plistDropZone.addEventListener('click', (e) => {
            if (e.target === this.plistDropZone || e.target.closest('.drop-content')) {
                this.plistInput.click();
            }
        });
        
        this.imageDropZone.addEventListener('click', (e) => {
            if (e.target === this.imageDropZone || e.target.closest('.drop-content')) {
                this.imageInput.click();
            }
        });
        
        // File input changes
        this.plistInput.addEventListener('change', (e) => this.handleFileSelect(e, 'plist'));
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e, 'image'));
        
        // Button events
        this.unpackBtn.addEventListener('click', this.unpackAtlas.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadAll.bind(this));
        this.clearBtn.addEventListener('click', this.clearAll.bind(this));
    }

    handleDragOver(e, type) {
        e.preventDefault();
        const dropZone = type === 'plist' ? this.plistDropZone : this.imageDropZone;
        dropZone.classList.add('dragover');
    }

    handleDragLeave(e, type) {
        e.preventDefault();
        const dropZone = type === 'plist' ? this.plistDropZone : this.imageDropZone;
        dropZone.classList.remove('dragover');
    }

    handleDrop(e, type) {
        e.preventDefault();
        const dropZone = type === 'plist' ? this.plistDropZone : this.imageDropZone;
        dropZone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            this.handleFile(files[0], type);
        }
    }

    handleFileSelect(e, type) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.handleFile(files[0], type);
        }
    }

    handleFile(file, type) {
        if (type === 'plist') {
            if (this.isValidPlistFile(file)) {
                this.plistFile = file;
                this.plistStatus.textContent = `✓ ${file.name}`;
                this.plistStatus.classList.add('success');
                // Clear the file input to avoid showing "No file chosen"
                this.plistInput.value = '';
            } else {
                this.plistStatus.textContent = '❌ File không hợp lệ (.plist, .xml, .tpsheet, .json)';
                this.plistStatus.classList.remove('success');
                this.plistInput.value = '';
            }
        } else if (type === 'image') {
            if (this.isValidImageFile(file)) {
                this.imageFile = file;
                this.imageStatus.textContent = `✓ ${file.name}`;
                this.imageStatus.classList.add('success');
                // Clear the file input to avoid showing "No file chosen"
                this.imageInput.value = '';
            } else {
                this.imageStatus.textContent = '❌ File không hợp lệ (.png, .jpg, .jpeg)';
                this.imageStatus.classList.remove('success');
                this.imageInput.value = '';
            }
        }
        
        this.updateUI();
    }

    isValidPlistFile(file) {
        const validExtensions = ['.plist', '.xml', '.tpsheet', '.json'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    isValidImageFile(file) {
        const validExtensions = ['.png', '.jpg', '.jpeg'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    updateUI() {
        this.unpackBtn.disabled = !this.plistFile || !this.imageFile;
        this.downloadBtn.disabled = this.processedSprites.length === 0;
    }



    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async unpackAtlas() {
        if (!this.plistFile || !this.imageFile) return;

        this.showProgress();
        this.processedSprites = [];

        try {
            // Step 1: Parse plist file
            this.updateProgress(20, 'Đang đọc file plist...');
            this.atlasData = await this.parsePlistFile(this.plistFile);
            
            // Step 2: Load image
            this.updateProgress(40, 'Đang tải image...');
            const atlasImage = await this.loadImage(this.imageFile);
            
            // Step 3: Extract sprites
            this.updateProgress(60, 'Đang tách sprites...');
            await this.extractSprites(this.atlasData, atlasImage);
            
            // Step 4: Complete
            this.updateProgress(100, 'Hoàn thành!');
            
            this.displayAtlasInfo();
            this.displayResults();
            
        } catch (error) {
            console.error('Lỗi unpacking atlas:', error);
            alert('Lỗi: ' + error.message);
        }

        this.hideProgress();
        this.updateUI();
    }

    async parsePlistFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const fileContent = e.target.result;
                    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
                    
                    let atlasData;
                    
                    if (extension === '.tpsheet') {
                        // Parse Unity TexturePacker format (Text format)
                        atlasData = this.parseTPSheetText(fileContent);
                    } else if (extension === '.json') {
                        // Parse Unity TexturePacker format (JSON)
                        atlasData = this.parseTPSheetJSON(fileContent);
                    } else {
                        // Parse Cocos Creator format (XML/plist)
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(fileContent, 'text/xml');
                        atlasData = this.parsePlistXML(xmlDoc);
                    }
                    
                    resolve(atlasData);
                } catch (error) {
                    reject(new Error('Không thể parse file atlas: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Không thể đọc file atlas'));
            reader.readAsText(file);
        });
    }

    parsePlistXML(xmlDoc) {
        const frames = {};
        const metadata = {};
        
        // Find the main dict element
        const mainDict = xmlDoc.querySelector('plist > dict');
        if (!mainDict) {
            throw new Error('Invalid plist format - no main dict found');
        }
        
        console.log('Parsing plist XML, main dict found');
        const keys = mainDict.querySelectorAll('key');
        console.log(`Found ${keys.length} keys in main dict`);
        
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const keyName = key.textContent.trim();
            const nextElement = key.nextElementSibling;
            
            if (keyName === 'frames' && nextElement && nextElement.tagName === 'dict') {
                // Parse frames
                console.log('Found frames section');
                const frameKeys = nextElement.querySelectorAll('key');
                console.log(`Found ${frameKeys.length} frame keys`);
                
                for (let j = 0; j < frameKeys.length; j++) {
                    const frameKey = frameKeys[j];
                    const frameName = frameKey.textContent.trim();
                    const frameDict = frameKey.nextElementSibling;
                    
                    if (frameDict && frameDict.tagName === 'dict') {
                        console.log(`Parsing frame: ${frameName}`);
                        frames[frameName] = this.parseFrameDict(frameDict);
                        console.log(`Frame data for ${frameName}:`, frames[frameName]);
                    }
                }
            } else if (keyName === 'metadata' && nextElement && nextElement.tagName === 'dict') {
                // Parse metadata
                const metaKeys = nextElement.querySelectorAll('key');
                for (let j = 0; j < metaKeys.length; j++) {
                    const metaKey = metaKeys[j];
                    const metaName = metaKey.textContent.trim();
                    const metaValue = metaKey.nextElementSibling;
                    
                    if (metaValue) {
                        metadata[metaName] = metaValue.textContent.trim();
                    }
                }
            }
        }
        
        return { frames, metadata };
    }

    parseTPSheetJSON(jsonContent) {
        try {
            const data = JSON.parse(jsonContent);
            const frames = {};
            const metadata = {
                format: 'Unity TexturePacker',
                textureFileName: data.meta?.image || 'unknown',
                size: data.meta?.size ? `{${data.meta.size.w},${data.meta.size.h}}` : 'unknown'
            };

            console.log('Parsing Unity TPSheet format');
            console.log('TPSheet data:', data);

            // Parse frames from Unity format
            if (data.frames) {
                const frameKeys = Object.keys(data.frames);
                console.log(`Found ${frameKeys.length} frames in TPSheet`);

                frameKeys.forEach(frameName => {
                    const frameData = data.frames[frameName];
                    console.log(`Parsing TPSheet frame: ${frameName}`, frameData);

                    frames[frameName] = {
                        frame: {
                            x: frameData.frame.x,
                            y: frameData.frame.y,
                            width: frameData.frame.w,
                            height: frameData.frame.h
                        },
                        rotated: frameData.rotated || false,
                        trimmed: frameData.trimmed || false,
                        spriteSourceSize: frameData.spriteSourceSize ? {
                            x: frameData.spriteSourceSize.x,
                            y: frameData.spriteSourceSize.y,
                            width: frameData.spriteSourceSize.w,
                            height: frameData.spriteSourceSize.h
                        } : null,
                        sourceSize: frameData.sourceSize ? {
                            width: frameData.sourceSize.w,
                            height: frameData.sourceSize.h
                        } : null
                    };
                });
            }

            return { frames, metadata };
        } catch (error) {
            throw new Error('Invalid TPSheet JSON format: ' + error.message);
        }
    }

    parseTPSheetText(textContent) {
        try {
            const lines = textContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            const frames = {};
            let metadata = {
                format: 'Unity TexturePacker Text',
                textureFileName: 'unknown',
                size: 'unknown'
            };

            console.log('Parsing Unity TPSheet text format');
            console.log('Lines to process:', lines.length);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Parse header line with format info
                if (line.startsWith(':format=')) {
                    const parts = line.split(':');
                    for (const part of parts) {
                        if (part.startsWith('texture=')) {
                            metadata.textureFileName = part.substring(8);
                        } else if (part.startsWith('size=')) {
                            const sizeStr = part.substring(5);
                            metadata.size = `{${sizeStr.replace('x', ',')}}`;
                        }
                    }
                    continue;
                }

                // Parse sprite data lines
                if (line.includes(';')) {
                    const sprite = this.parseTPSheetSpriteLine(line);
                    if (sprite) {
                        frames[sprite.name] = sprite.data;
                        console.log(`Parsed TPSheet sprite: ${sprite.name}`, sprite.data);
                    }
                }
            }

            console.log(`Parsed ${Object.keys(frames).length} sprites from TPSheet`);
            return { frames, metadata };
        } catch (error) {
            throw new Error('Invalid TPSheet text format: ' + error.message);
        }
    }

    parseTPSheetSpriteLine(line) {
        try {
            // TPSheet format: name;x;y;w;h;pivotX;pivotY;borderL;borderR;borderT;borderB;...
            const parts = line.split(';');
            
            if (parts.length < 5) {
                console.warn('Invalid TPSheet line format:', line);
                return null;
            }

            const name = parts[0];
            const x = parseInt(parts[1]) || 0;
            const y = parseInt(parts[2]) || 0;
            const width = parseInt(parts[3]) || 0;
            const height = parseInt(parts[4]) || 0;

            // Extract pivot if available
            let pivotX = 0.5, pivotY = 0.5;
            if (parts.length > 6) {
                pivotX = parseFloat(parts[5]) || 0.5;
                pivotY = parseFloat(parts[6]) || 0.5;
            }

            // Extract borders if available
            let borderL = 0, borderR = 0, borderT = 0, borderB = 0;
            if (parts.length > 10) {
                borderL = parseInt(parts[7]) || 0;
                borderR = parseInt(parts[8]) || 0;
                borderT = parseInt(parts[9]) || 0;
                borderB = parseInt(parts[10]) || 0;
            }

            return {
                name: name,
                data: {
                    frame: {
                        x: x,
                        y: y,
                        width: width,
                        height: height
                    },
                    rotated: false, // TPSheet text format doesn't seem to have rotation info in this format
                    trimmed: borderL > 0 || borderR > 0 || borderT > 0 || borderB > 0,
                    pivot: {
                        x: pivotX,
                        y: pivotY
                    },
                    borders: {
                        left: borderL,
                        right: borderR,
                        top: borderT,
                        bottom: borderB
                    },
                    sourceSize: {
                        width: width,
                        height: height
                    }
                }
            };
        } catch (error) {
            console.error('Error parsing TPSheet sprite line:', line, error);
            return null;
        }
    }

    parseFrameDict(frameDict) {
        const frame = {};
        const keys = frameDict.querySelectorAll('key');
        
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const keyName = key.textContent.trim();
            const value = key.nextElementSibling;
            
            if (value) {
                const valueText = value.textContent.trim();
                
                switch (keyName) {
                    case 'textureRect':
                        // This is the main frame data - parse as frame
                        frame.frame = this.parseRect(valueText);
                        break;
                    case 'spriteSize':
                        frame.spriteSize = this.parseSize(valueText);
                        break;
                    case 'spriteSourceSize':
                        frame.sourceSize = this.parseSize(valueText);
                        break;
                    case 'spriteOffset':
                        frame.offset = this.parseOffset(valueText);
                        break;
                    case 'textureRotated':
                        frame.rotated = value.tagName === 'true';
                        break;
                    case 'frame':
                    case 'sourceColorRect':
                    case 'sourceSize':
                        frame[keyName] = this.parseRect(valueText);
                        break;
                    case 'rotated':
                        frame[keyName] = value.tagName === 'true';
                        break;
                    default:
                        frame[keyName] = valueText;
                }
            }
        }
        
        return frame;
    }

    parseRect(rectString) {
        try {
            // Parse strings like "{{x,y},{w,h}}" or "{x,y,w,h}"
            const cleaned = rectString.replace(/[{}]/g, '');
            const numbers = cleaned.split(',').map(n => {
                const num = parseInt(n.trim());
                return isNaN(num) ? 0 : num;
            });
            
            if (numbers.length === 4) {
                return {
                    x: numbers[0],
                    y: numbers[1],
                    width: numbers[2],
                    height: numbers[3]
                };
            }
            
            console.warn('Invalid rect format:', rectString);
            return { x: 0, y: 0, width: 0, height: 0 };
        } catch (error) {
            console.error('Error parsing rect:', rectString, error);
            return { x: 0, y: 0, width: 0, height: 0 };
        }
    }

    parseSize(sizeString) {
        try {
            // Parse strings like "{width,height}"
            const cleaned = sizeString.replace(/[{}]/g, '');
            const numbers = cleaned.split(',').map(n => {
                const num = parseInt(n.trim());
                return isNaN(num) ? 0 : num;
            });
            
            if (numbers.length === 2) {
                return {
                    width: numbers[0],
                    height: numbers[1]
                };
            }
            
            console.warn('Invalid size format:', sizeString);
            return { width: 0, height: 0 };
        } catch (error) {
            console.error('Error parsing size:', sizeString, error);
            return { width: 0, height: 0 };
        }
    }

    parseOffset(offsetString) {
        try {
            // Parse strings like "{x,y}"
            const cleaned = offsetString.replace(/[{}]/g, '');
            const numbers = cleaned.split(',').map(n => {
                const num = parseInt(n.trim());
                return isNaN(num) ? 0 : num;
            });
            
            if (numbers.length === 2) {
                return {
                    x: numbers[0],
                    y: numbers[1]
                };
            }
            
            console.warn('Invalid offset format:', offsetString);
            return { x: 0, y: 0 };
        } catch (error) {
            console.error('Error parsing offset:', offsetString, error);
            return { x: 0, y: 0 };
        }
    }

    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Không thể load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Không thể đọc image file'));
            reader.readAsDataURL(file);
        });
    }

    async extractSprites(atlasData, atlasImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const sprites = [];
        const frameNames = Object.keys(atlasData.frames);
        
        for (let i = 0; i < frameNames.length; i++) {
            const frameName = frameNames[i];
            const frameData = atlasData.frames[frameName];
            
            this.updateProgress(60 + (i / frameNames.length) * 30, `Tách sprite: ${frameName}`);
            
            // Extract sprite from atlas
            const sprite = await this.extractSingleSprite(frameName, frameData, atlasImage, canvas, ctx);
            sprites.push(sprite);
            
            await this.delay(50);
        }
        
        this.processedSprites = sprites;
    }

    async extractSingleSprite(name, frameData, atlasImage, canvas, ctx) {
        // Validate frame data
        if (!frameData || !frameData.frame) {
            console.error(`Invalid frame data for sprite: ${name}`, frameData);
            return {
                name: name,
                width: 0,
                height: 0,
                rotated: false,
                dataUrl: '',
                frameData: frameData,
                error: 'Invalid frame data'
            };
        }
        
        const frame = frameData.frame;
        
        // Validate frame dimensions
        if (!frame.width || !frame.height || frame.width <= 0 || frame.height <= 0) {
            console.error(`Invalid frame dimensions for sprite: ${name}`, frame);
            return {
                name: name,
                width: frame.width || 0,
                height: frame.height || 0,
                rotated: false,
                dataUrl: '',
                frameData: frameData,
                error: 'Invalid dimensions'
            };
        }
        
        // Set canvas size to sprite size
        canvas.width = frame.width;
        canvas.height = frame.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw sprite from atlas
        if (frameData.rotated) {
            // Handle rotated sprites - Unity format rotates 90 degrees clockwise
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI / 2); // 90 degrees clockwise for Unity
            ctx.drawImage(
                atlasImage,
                frame.x, frame.y, frame.width, frame.height,
                -frame.height / 2, -frame.width / 2, frame.height, frame.width
            );
            ctx.restore();
        } else {
            // Normal sprites
            ctx.drawImage(
                atlasImage,
                frame.x, frame.y, frame.width, frame.height,
                0, 0, frame.width, frame.height
            );
        }
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        return {
            name: name,
            width: frame.width,
            height: frame.height,
            rotated: frameData.rotated || false,
            dataUrl: dataUrl,
            frameData: frameData
        };
    }

    displayAtlasInfo() {
        if (!this.atlasData) return;
        
        const frameCount = Object.keys(this.atlasData.frames).length;
        const metadata = this.atlasData.metadata;
        
        this.atlasInfo.innerHTML = `
            <div class="atlas-info-item">
                <span>Số lượng sprites:</span>
                <span>${frameCount}</span>
            </div>
            <div class="atlas-info-item">
                <span>Format:</span>
                <span>${metadata.format || 'Unknown'}</span>
            </div>
            <div class="atlas-info-item">
                <span>Texture file:</span>
                <span>${metadata.textureFileName || this.imageFile.name}</span>
            </div>
            <div class="atlas-info-item">
                <span>Size:</span>
                <span>${metadata.size || 'Unknown'}</span>
            </div>
        `;
        
        this.infoSection.style.display = 'block';
    }

    displayResults() {
        this.textureGrid.innerHTML = '';
        
        this.processedSprites.forEach((sprite, index) => {
            const spriteItem = document.createElement('div');
            spriteItem.className = 'texture-item';
            
            // Handle error sprites
            if (sprite.error) {
                spriteItem.innerHTML = `
                    <div class="texture-preview error-preview">❌</div>
                    <div class="texture-info">
                        <div class="texture-name">${sprite.name}</div>
                        <div style="color: red;">Lỗi: ${sprite.error}</div>
                        <div>Kích thước: ${sprite.width} x ${sprite.height}</div>
                    </div>
                `;
            } else {
                spriteItem.innerHTML = `
                    <img src="${sprite.dataUrl}" alt="${sprite.name}" class="texture-preview">
                    <div class="texture-info">
                        <div class="texture-name">${sprite.name}</div>
                        <div>Kích thước: ${sprite.width} x ${sprite.height}</div>
                        <div>Vị trí: (${sprite.frameData.frame.x}, ${sprite.frameData.frame.y})</div>
                        ${sprite.frameData.trimmed ? '<div style="color: orange;">Trimmed: Có</div>' : ''}
                        ${sprite.frameData.pivot ? `<div>Pivot: (${sprite.frameData.pivot.x}, ${sprite.frameData.pivot.y})</div>` : ''}
                        <div>Rotated: ${sprite.rotated ? 'Có' : 'Không'}</div>
                        <button onclick="textureUnpacker.downloadSingle(${index})" style="margin-top: 10px; padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Tải xuống
                        </button>
                    </div>
                `;
            }
            
            this.textureGrid.appendChild(spriteItem);
        });
    }

    showProgress() {
        this.progressSection.style.display = 'block';
        this.updateProgress(0, 'Bắt đầu xử lý...');
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = percent + '%';
        this.progressText.textContent = `${Math.round(percent)}% - ${text}`;
    }

    async downloadSingle(index) {
        const sprite = this.processedSprites[index];
        if (!sprite) return;

        const link = document.createElement('a');
        // Clean filename - remove extension and add .png
        const cleanName = sprite.name.replace(/\.[^/.]+$/, "");
        link.download = `${cleanName}.png`;
        link.href = sprite.dataUrl;
        link.click();
    }

    async downloadAll() {
        if (this.processedSprites.length === 0) return;

        this.showProgress();
        
        for (let i = 0; i < this.processedSprites.length; i++) {
            const progress = ((i + 1) / this.processedSprites.length) * 100;
            this.updateProgress(progress, `Tải xuống: ${this.processedSprites[i].name}`);
            
            await this.downloadSingle(i);
            await this.delay(200); // Small delay between downloads
        }
        
        this.hideProgress();
    }

    clearAll() {
        this.plistFile = null;
        this.imageFile = null;
        this.atlasData = null;
        this.processedSprites = [];
        
        this.textureGrid.innerHTML = '';
        this.plistInput.value = '';
        this.imageInput.value = '';
        
        this.plistStatus.textContent = 'Chưa chọn file';
        this.plistStatus.classList.remove('success');
        this.imageStatus.textContent = 'Chưa chọn file';
        this.imageStatus.classList.remove('success');
        
        this.infoSection.style.display = 'none';
        
        this.updateUI();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the texture unpacker when page loads
let textureUnpacker;
document.addEventListener('DOMContentLoaded', () => {
    textureUnpacker = new TextureUnpacker();
});