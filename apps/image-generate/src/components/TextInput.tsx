import type { TextAlignment, TextVerticalAlignment } from '../types';
import { createNumberInputHandler } from '../utils/inputValidation';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Type,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TextInputProps {
  text: string;
  fontSize: number;
  textAlignment: TextAlignment;
  textVerticalAlignment: TextVerticalAlignment;
  onTextChange: (text: string) => void;
  onFontSizeChange: (size: number) => void;
  onTextAlignmentChange: (alignment: TextAlignment) => void;
  onTextVerticalAlignmentChange: (alignment: TextVerticalAlignment) => void;
}

export function TextInput({
  text,
  fontSize,
  textAlignment,
  textVerticalAlignment,
  onTextChange,
  onFontSizeChange,
  onTextAlignmentChange,
  onTextVerticalAlignmentChange,
}: TextInputProps) {
  const handleFontSizeChange = createNumberInputHandler(onFontSizeChange, {
    min: 1,
    max: 500,
  });

  return (
    <div className="space-y-4 border-b pb-6">
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">テキスト</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-input">テキスト</Label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          placeholder="テキストを入力..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-size-input">フォントサイズ (px)</Label>
        <Input
          id="font-size-input"
          type="number"
          min="1"
          max="500"
          value={fontSize}
          onChange={handleFontSizeChange}
        />
      </div>

      <div className="space-y-2">
        <Label>水平方向の配置</Label>
        <div className="flex gap-2">
          <Button
            variant={textAlignment === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextAlignmentChange('left')}
            type="button"
            className="flex-1"
          >
            <AlignLeft className="mr-1 h-4 w-4" />左
          </Button>
          <Button
            variant={textAlignment === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextAlignmentChange('center')}
            type="button"
            className="flex-1"
          >
            <AlignCenter className="mr-1 h-4 w-4" />
            中央
          </Button>
          <Button
            variant={textAlignment === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextAlignmentChange('right')}
            type="button"
            className="flex-1"
          >
            <AlignRight className="mr-1 h-4 w-4" />右
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>垂直方向の配置</Label>
        <div className="flex gap-2">
          <Button
            variant={textVerticalAlignment === 'top' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextVerticalAlignmentChange('top')}
            type="button"
            className="flex-1"
          >
            <AlignVerticalJustifyStart className="mr-1 h-4 w-4" />上
          </Button>
          <Button
            variant={textVerticalAlignment === 'middle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextVerticalAlignmentChange('middle')}
            type="button"
            className="flex-1"
          >
            <AlignVerticalJustifyCenter className="mr-1 h-4 w-4" />
            中央
          </Button>
          <Button
            variant={textVerticalAlignment === 'bottom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextVerticalAlignmentChange('bottom')}
            type="button"
            className="flex-1"
          >
            <AlignVerticalJustifyEnd className="mr-1 h-4 w-4" />下
          </Button>
        </div>
      </div>
    </div>
  );
}
