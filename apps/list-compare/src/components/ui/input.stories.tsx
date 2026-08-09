import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'list-compare/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Text</Label>
        <Input id="text" type="text" placeholder="Text input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number">Number</Label>
        <Input id="number" type="number" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input id="url" type="url" placeholder="https://example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" placeholder="Disabled input" disabled />
      </div>
    </div>
  ),
};
