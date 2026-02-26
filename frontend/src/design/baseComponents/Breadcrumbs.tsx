import React from 'react';
import { Flex } from '../primitives/Flex';
import { Text } from './Text';
import { cn } from '@/src/shared/utils/cn';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    className?: string;
}

/**
 * ページの階層構造を示すナビゲーションコンポーネントです。
 */
export function Breadcrumbs({
    items,
    separator = <ChevronRight size={14} className="text-slate-400" />,
    className
}: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <Flex align="center" gap="xs" wrap>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <React.Fragment key={index}>
                            <Flex align="center" gap="xs">
                                {item.icon}
                                {isLast || !item.href ? (
                                    <Text
                                        variant="xs"
                                        weight={isLast ? 'bold' : 'medium'}
                                        color={isLast ? 'primary' : 'muted'}
                                    >
                                        {item.label}
                                    </Text>
                                ) : (
                                    <a
                                        href={item.href}
                                        className="text-xs font-medium text-slate-500 hover:text-brand-primary transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                )}
                            </Flex>
                            {!isLast && separator}
                        </React.Fragment>
                    );
                })}
            </Flex>
        </nav>
    );
}
