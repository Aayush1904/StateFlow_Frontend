import React, { useState } from 'react';
import { RichTextEditor } from '@/components/workspace/editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Save } from 'lucide-react';

const TestEditor: React.FC = () => {
    const [content, setContent] = useState('<p>Welcome to the Rich Text Editor!</p><p>Try formatting your text with the toolbar above.</p>');
    const [savedContent, setSavedContent] = useState('');

    const handleSave = (newContent: string) => {
        setSavedContent(newContent);
        console.log('Content saved:', newContent);
    };

    return (
        <div className="w-full space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Rich Text Editor Demo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This is a demonstration of the rich text editor. Try the formatting options in the toolbar above.
                        </p>

                        <RichTextEditor
                            content={content}
                            onUpdate={setContent}
                            onSave={handleSave}
                            placeholder="Start writing your content here..."
                            className="min-h-[300px]"
                        />

                        <div className="flex items-center gap-2">
                            <Button onClick={() => handleSave(content)}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Content
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {savedContent ? 'Content saved!' : 'Click save to store content'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
            {savedContent && (
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: savedContent }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TestEditor;
