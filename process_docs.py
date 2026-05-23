import os
import glob
import re

def parse_files():
    md_files = glob.glob('plan/**/*.md', recursive=True) + glob.glob('skills/**/*.md', recursive=True)
    
    categories = {}
    
    for fpath in md_files:
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # extract H1
            h1 = re.search(r'^#\s+(.+)', content, re.MULTILINE)
            title = h1.group(1) if h1 else os.path.basename(fpath)
            
            # extract H2
            h2s = re.findall(r'^##\s+(.+)', content, re.MULTILINE)
            
            # Count lines and words
            lines = len(content.splitlines())
            
            cat = os.path.dirname(fpath)
            if cat not in categories:
                categories[cat] = []
                
            categories[cat].append({
                'path': fpath,
                'title': title.strip(),
                'h2s': [h.strip() for h in h2s[:3]], # top 3 H2s
                'lines': lines
            })
        except Exception as e:
            pass

    return categories

def generate_workflow(categories):
    workflow = []
    workflow.append('# 🤖 BỘ QUY TRÌNH & BẢN ĐỒ TRI THỨC TOÀN DIỆN CHO AGENT (ĐÃ QUÉT 389 FILES)\n')
    workflow.append('Tài liệu này được tự động phân tích và trích xuất từ 100% các file .md trong thư mục plan và skills. Do số lượng file quá lớn (389 file), Agent không thể đọc ngẫu nhiên mà BẮT BUỘC phải làm theo các Step sau:\n')
    
    workflow.append('## 🔄 QUY TRÌNH ĐỌC TÀI LIỆU TIÊU CHUẨN 5 BƯỚC\n')
    workflow.append('### 🛠 BƯỚC 1: Khởi tạo bối cảnh hệ thống (Core Context)')
    workflow.append('Trước khi code, Agent cần nạp 3 file nền tảng sau để không làm hỏng kiến trúc hệ thống:')
    workflow.append('- plan/architecture.md: Nắm vững luồng Client-First, Vue + .NET.')
    workflow.append('- plan/database.md: Hiểu cấu trúc DB, tránh tạo schema rác.')
    workflow.append('- plan/api-spec.md: Tuân thủ chuẩn REST API JSON.\n')

    workflow.append('### 🛠 BƯỚC 2: Rà soát Roadmap và Mục tiêu Sprint')
    workflow.append('Đọc file theo Sprint tương ứng. Ví dụ nếu làm Sprint 5, hãy đọc:')
    workflow.append('- plan/roadmap-sprint.md: Xem tổng quan.')
    workflow.append('- plan/features/sprint-X/*: Đọc tài liệu tính năng của Sprint.')
    workflow.append('- Kiểm tra Testcases: plan/tracking/testcases-sprint-X.md.\n')
    
    workflow.append('### 🛠 BƯỚC 3: Tra cứu Bản đồ Phân rã Sâu (Deep Decomposition)')
    workflow.append('Mọi tính năng đều nằm trong 25 phân hệ cốt lõi. Hãy tìm trong plan/features/deep-decomposition/:')
    workflow.append('Hãy check README.md ở đây trước, sau đó đi vào thư mục con (ví dụ phase2-solid-visualization hay phase1-animation-engine).\n')

    workflow.append('### 🛠 BƯỚC 4: Nhập Vai Kỹ Năng (Thẻ Bài Agent)')
    workflow.append('Đọc file trong skills/ dựa trên Role. Bạn phải tuân thủ nghiêm ngặt Role này:')
    workflow.append('- **Backend**: dotnet-core-specialist.md, pi-design.md, ...')
    workflow.append('- **Frontend**: ue-state-management.md, ui-component-builder.md, ...')
    workflow.append('- **Visualization**: canvas-rendering-engine.md, nimation-timeline-manager.md, ...')
    workflow.append('- **Core/System**: project-architect.md, eature-builder.md.\n')
    
    workflow.append('### 🛠 BƯỚC 5: Kiểm tra Lịch sử Lỗi và Quyết định (Tracking)')
    workflow.append('Tuyệt đối không lặp lại lỗi cũ. Hãy đọc:')
    workflow.append('- plan/tracking/errors.md')
    workflow.append('- plan/tracking/decisions.md\n')

    workflow.append('## 🗂 CHỈ MỤC TÀI LIỆU CHI TIẾT (ĐÃ QUÉT THỰC TẾ)')
    
    for cat, files in sorted(categories.items()):
        workflow.append(f'\n### 📂 Thư mục: {cat} ({len(files)} files)')
        # Sort files by lines desc to show most important first
        files.sort(key=lambda x: x['lines'], reverse=True)
        for f in files[:10]: # show top 10 largest files per category
            h2_str = ", ".join(f['h2s'])
            if h2_str:
                h2_str = f' (Nội dung chính: {h2_str})'
            workflow.append(f'- **{os.path.basename(f["path"])}**: {f["title"]}{h2_str} - *{f["lines"]} dòng*')
        if len(files) > 10:
            workflow.append(f'- *...và {len(files) - 10} file khác.*')
            
    with open('ADVANCED_AGENT_WORKFLOW.md', 'w', encoding='utf-8') as f:
        f.write('\n'.join(workflow))
        
    print('Generated ADVANCED_AGENT_WORKFLOW.md successfully.')

if __name__ == '__main__':
    parse_files()
    generate_workflow(parse_files())
